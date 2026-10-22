import { describe, it, expect } from "vitest";
import { simulate, importScenario } from "../../src/network/simulation";
import {
  laboratory,
  validateTopology,
  longestPrefix,
  routingTables,
} from "../../src/network/topology";
import { NetworkPlayback } from "../../src/engine/network-playback";
import { scenarios } from "../../src/scenarios/network";
describe("debug audit regressions", () => {
  it("recomputes weighted forwarding after a propagation-delay change", () => {
    const r = simulate({
      faults: [{ time: 0, kind: "delay", link: "l3", value: 180 }],
    });
    expect(r.status).toBe("Complete");
    const f = r.events.find((e) => e.kind === "fault")!;
    expect(longestPrefix(f.tables.routes.r1, "192.168.2.20")?.interface).toBe(
      "r1c",
    );
  });
  it("chooses the shortest advertised subnet independent of device order", () => {
    const t = laboratory();
    t.links.find((l) => l.id === "l3")!.delay = 180;
    t.devices.reverse();
    expect(longestPrefix(routingTables(t).r1, "192.168.2.20")?.interface).toBe(
      "r1c",
    );
  });
  it("resolves a router next hop across an intervening Ethernet switch", () => {
    const t = laboratory();
    t.devices.push({
      id: "transit",
      kind: "switch",
      name: "Transit switch",
      x: 550,
      y: 320,
      interfaces: [
        { id: "transit0", mac: "02:00:00:00:01:01" },
        { id: "transit1", mac: "02:00:00:00:01:02" },
      ],
    });
    const l = t.links.find((l) => l.id === "l3")!;
    l.b = "transit0";
    t.links.push({
      id: "l8",
      a: "transit1",
      b: "r2a",
      delay: 1,
      bandwidth: 64000,
      up: true,
    });
    const r = simulate({}, t);
    expect(r.status).toBe("Complete");
    expect(
      r.events.some((e) => e.device === "transit" && e.kind === "learn"),
    ).toBe(true);
  });
  it("starts data from the sender without observing remote final-ACK receipt", () => {
    const r = simulate();
    const synack = r.events.find(
      (e) =>
        e.kind === "arrive" &&
        e.device === "a" &&
        e.frame?.packet?.type === "SYN-ACK",
    )!;
    const data = r.events.find(
      (e) => e.kind === "packet" && e.frame?.packet?.type === "DATA",
    )!;
    expect(data.time).toBe(synack.time);
  });
  it("can complete when the final handshake ACK is lost", () => {
    const r = simulate({ faults: [{ time: 0, kind: "ack" }] });
    expect(r.status).toBe("Complete");
    expect(r.metrics.drops).toBe(1);
  });
  it("rejects a multihomed host instead of silently ignoring its other interfaces", () => {
    const t = laboratory();
    t.devices[0].interfaces.push({
      id: "extra",
      ip: "172.16.0.2",
      prefix: 24,
      mac: "02:00:00:00:02:01",
    });
    expect(() => validateTopology(t)).toThrow(/single|one interface/i);
  });
  it("rejects case-insensitive duplicate MAC addresses", () => {
    const t = laboratory();
    t.devices[0].interfaces[0].mac = "02:00:00:00:00:AA";
    t.devices[1].interfaces[0].mac = "02:00:00:00:00:aa";
    expect(() => validateTopology(t)).toThrow(/MAC/);
  });
  it("rejects noncanonical IPv4 strings and non-unicast MACs", () => {
    const t = laboratory();
    t.devices[0].interfaces[0].ip = "192.168.001.10";
    expect(() => validateTopology(t)).toThrow(/IPv4/);
    t.devices[0].interfaces[0].ip = "192.168.1.10";
    t.devices[0].interfaces[0].mac = "ff:ff:ff:ff:ff:ff";
    expect(() => validateTopology(t)).toThrow(/MAC/);
  });
  it("handles structurally malformed imports with a useful error", () => {
    expect(() => importScenario("null")).toThrow(/scenario/i);
    expect(() => importScenario('{"version":1}')).toThrow();
  });
  it("Replay without a loaded run stays idle", () => {
    const p = new NetworkPlayback();
    p.replay();
    p.tick(1);
    expect(p.playing).toBe(false);
    expect(p.time).toBe(0);
  });
  it("stepping stays on its exact snapshot until the clock advances", () => {
    const r = simulate(),
      p = new NetworkPlayback();
    p.load(r);
    p.next();
    const e = p.current;
    p.tick(1);
    expect(p.current).toBe(e);
  });
  for (const s of scenarios)
    it(`finishes the ${s.id} experiment consistently`, () => {
      const r = simulate(s.config);
      expect(r.status).toBe(
        ["udp", "no-route", "ttl"].includes(s.id) ? "Failed" : "Complete",
      );
      if (r.status === "Complete")
        expect(r.received).toBe(s.config.message ?? "Hello, network!");
    });
});

it("counts unroutable IP packets among actual drops", () => {
  const r = simulate({
    faults: [
      { time: 0, kind: "link", link: "l3" },
      { time: 0, kind: "link", link: "l6" },
    ],
  });
  expect(r.metrics.drops).toBeGreaterThan(0);
  expect(r.events.at(-1)!.metrics).toEqual(r.metrics);
});
it("preserves the identity of the cheaper parallel cable", () => {
  const t = laboratory();
  t.devices
    .find((d) => d.id === "r1")!
    .interfaces.push({
      id: "r1d",
      ip: "172.16.0.1",
      prefix: 30,
      mac: "02:00:00:00:03:01",
    });
  t.devices
    .find((d) => d.id === "r2")!
    .interfaces.push({
      id: "r2d",
      ip: "172.16.0.2",
      prefix: 30,
      mac: "02:00:00:00:03:02",
    });
  t.links.push({
    id: "l8",
    a: "r1d",
    b: "r2d",
    delay: 1,
    bandwidth: 64000,
    up: true,
  });
  const r = simulate({}, t);
  expect(r.status).toBe("Complete");
  expect(
    longestPrefix(r.events[0].tables.routes.r1, "192.168.2.20")?.interface,
  ).toBe("r1d");
});
it("has bounded, honest outcomes across seeds, loss settings, and protocols", () => {
  const message = "Audit 🌏 UTF-8";
  for (const protocol of ["TCP", "UDP"] as const)
    for (const seed of [0, 1, 42, 65535])
      for (const loss of [0, 0.03, 0.2, 1]) {
        const r = simulate({ protocol, message, seed, loss, mss: 3 });
        expect(["Complete", "Failed"]).toContain(r.status);
        expect(r.metrics.bytes).toBeLessThanOrEqual(
          new TextEncoder().encode(message).length,
        );
        expect(
          r.events.every(
            (e, i) => !i || e.metrics.bytes >= r.events[i - 1].metrics.bytes,
          ),
        ).toBe(true);
        if (r.status === "Complete") expect(r.received).toBe(message);
        if (loss === 0) expect(r.status).toBe("Complete");
        if (loss === 1) expect(r.status).toBe("Failed");
        if (protocol === "UDP") {
          expect(r.metrics.acks).toBe(0);
          expect(r.metrics.retransmissions).toBe(0);
        }
      }
});
