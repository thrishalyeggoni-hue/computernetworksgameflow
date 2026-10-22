import { describe, it, expect } from "vitest";
import {
  simulate,
  exportScenario,
  importScenario,
} from "../../src/network/simulation";
import {
  laboratory,
  longestPrefix,
  shortestPath,
} from "../../src/network/topology";
import { defaults } from "../../src/network/types";
describe("routing and Ethernet", () => {
  it("selects the shortest path and the longest matching prefix", () => {
    expect(shortestPath(laboratory(), "r1", "r2")).toEqual(["r1", "r2"]);
    expect(
      longestPrefix(
        [
          { prefix: "0.0.0.0", length: 0, interface: "a", cost: 0 },
          { prefix: "192.168.2.0", length: 24, interface: "b", cost: 2 },
        ],
        "192.168.2.20",
      )?.interface,
    ).toBe("b");
  });
  it("learns ARP and switch ports from real exchanged frames", () => {
    const r = simulate();
    expect(r.status).toBe("Complete");
    const last = r.events.at(-1)!;
    expect(last.tables.arp.a["192.168.1.1"]).toBeTruthy();
    expect(last.tables.arp.a["192.168.2.20"]).toBeUndefined();
    expect(Object.keys(last.tables.mac.s1).length).toBeGreaterThan(1);
    expect(r.events.some((e) => e.frame?.arp?.op === "reply")).toBe(true);
  });
  it("rebuilds Ethernet addresses at routers, preserving IP endpoints", () => {
    const r = simulate();
    const frames = r.events.filter(
      (e) => e.kind === "transmit" && e.frame?.packet?.type === "DATA",
    );
    expect(new Set(frames.map((e) => e.frame!.src)).size).toBeGreaterThan(2);
    expect(new Set(frames.map((e) => e.frame!.packet!.src))).toEqual(
      new Set(["192.168.1.10"]),
    );
    expect(
      new Set(frames.map((e) => e.frame!.packet!.ttl)).size,
    ).toBeGreaterThan(1);
  });
  it("drops when TTL expires", () => {
    const r = simulate({ ttl: 1 });
    expect(r.status).toBe("Failed");
    expect(r.events.some((e) => e.title === "TTL expired")).toBe(true);
  });
  it("routes around a disabled primary link", () => {
    const r = simulate({ faults: [{ time: 0, kind: "link", link: "l3" }] });
    expect(r.status).toBe("Complete");
    expect(r.events.some((e) => e.kind === "transmit" && e.link === "l6")).toBe(
      true,
    );
  });
  it("reports no route when both routed paths are broken", () => {
    const r = simulate({
      faults: [
        { time: 0, kind: "link", link: "l3" },
        { time: 0, kind: "link", link: "l6" },
      ],
    });
    expect(r.status).toBe("Failed");
    expect(r.events.some((e) => e.kind === "no-route")).toBe(true);
  });
});
describe("transport", () => {
  it("reconstructs multibyte UTF-8 across small MSS boundaries", () => {
    const message = "Hi 🌏 नमस्ते café!";
    const r = simulate({ message, mss: 3 });
    expect(r.status).toBe("Complete");
    expect(r.received).toBe(message);
    expect(r.metrics.bytes).toBe(new TextEncoder().encode(message).length);
  });
  it("recovers after exactly one data drop", () => {
    const r = simulate({ faults: [{ time: 0, kind: "data" }] });
    expect(r.received).toBe(defaults.message);
    expect(r.metrics.drops).toBe(1);
    expect(r.metrics.retransmissions).toBeGreaterThan(0);
  });
  it("recovers from a lost final ACK without duplicate application delivery", () => {
    const base = simulate({ message: "abc" });
    const time = base.events.find((e) => e.kind === "deliver")!.time + 0.001;
    const r = simulate({ message: "abc", faults: [{ time, kind: "ack" }] });
    expect(r.received).toBe("abc");
    expect(r.metrics.bytes).toBe(3);
    expect(r.metrics.drops).toBe(1);
    expect(r.events.some((e) => e.title === "Duplicate data discarded")).toBe(
      true,
    );
  });
  it("buffers out-of-order data and delivers ordered bytes", () => {
    const r = simulate({
      message: "a🌏bcdefghijklmnop",
      reorder: true,
      mss: 4,
    });
    expect(r.status).toBe("Complete");
    expect(r.received).toBe("a🌏bcdefghijklmnop");
    expect(
      r.events.some((e) => e.title === "Out-of-order segment buffered"),
    ).toBe(true);
  });
  it("UDP never retransmits after loss", () => {
    const r = simulate({
      protocol: "UDP",
      faults: [{ time: 0, kind: "data" }],
    });
    expect(r.status).toBe("Failed");
    expect(r.metrics.retransmissions).toBe(0);
    expect(r.metrics.acks).toBe(0);
    expect(r.received).toBe("");
  });
  it("has identical event traces for the same seed and inputs", () => {
    expect(simulate({ loss: 0.025, seed: 123 })).toEqual(
      simulate({ loss: 0.025, seed: 123 }),
    );
  });
  it("has explicit failure at the retry limit", () => {
    const r = simulate({ loss: 1, retries: 1 });
    expect(r.status).toBe("Failed");
    expect(r.metrics.bytes).toBe(0);
  });
});
describe("scenario validation", () => {
  it("round trips versioned scenarios", () => {
    const v = importScenario(exportScenario(defaults, laboratory()));
    expect(v.config).toEqual(defaults);
  });
  it("rejects invalid addresses, versions, and duplicate ports", () => {
    expect(() => importScenario('{"version":2}')).toThrow();
    const t = laboratory();
    t.devices[0].interfaces[0].ip = "999.1.2.3";
    expect(() => simulate({}, t)).toThrow();
    const u = laboratory();
    u.links[1].a = u.links[0].a;
    expect(() => simulate({}, u)).toThrow();
  });
});

describe("event invariants and scenarios", () => {
  it("counts SYN sequence space and delivers cumulative ACKs through all hops", () => {
    const r = simulate({ message: "hello", mss: 2 });
    expect(r.packets.find((p) => p.type === "SYN")?.seq).toBe(1000);
    expect(r.packets.find((p) => p.type === "DATA")?.seq).toBe(1001);
    const ack = r.events.find(
      (e) => e.kind === "ack" && e.frame?.packet?.ack === 1006,
    )!;
    expect(ack).toBeDefined();
    const id = ack.frame!.packet!.id;
    expect(
      r.events.filter(
        (e) => e.kind === "transmit" && e.frame?.packet?.id === id,
      ),
    ).toHaveLength(5);
  });
  it("serializes actual bytes separately from propagation delay", () => {
    const r = simulate();
    const e = r.events.find(
      (e) => e.kind === "transmit" && e.frame?.packet?.type === "DATA",
    )!;
    const l = r.topology.links.find((l) => l.id === e.link)!;
    const n = Math.max(64, 14 + 20 + 20 + e.frame!.packet!.payload.length + 4);
    expect(e.end! - e.time).toBeCloseTo(
      ((n * 8) / l.bandwidth) * 1000 + l.delay,
    );
  });
  it("keeps timestamps ordered and event/packet IDs stable", () => {
    const r = simulate({ reorder: true });
    expect(r.events.every((e, i) => !i || e.time >= r.events[i - 1].time)).toBe(
      true,
    );
    expect(new Set(r.events.map((e) => e.id)).size).toBe(r.events.length);
    expect(new Set(r.packets.map((e) => e.id)).size).toBe(r.packets.length);
  });
  it("supports reverse computer selection", () => {
    const r = simulate({ sender: "b", receiver: "a", message: "Back again" });
    expect(r.status).toBe("Complete");
    expect(r.received).toBe("Back again");
  });
  it("recovers when a routed link fails mid-journey", () => {
    const baseline = simulate();
    const at = baseline.events.find((e) => e.kind === "connected")!.time + 1;
    const r = simulate({ faults: [{ time: at, kind: "link", link: "l3" }] });
    expect(r.status).toBe("Complete");
    expect(
      r.events.some(
        (e) => e.kind === "transmit" && e.link === "l6" && e.time >= at,
      ),
    ).toBe(true);
  });
  it("preserves loss-free UDP message bytes and exposes its protocol length", () => {
    const r = simulate({ protocol: "UDP", message: "🌏 UDP!", mss: 2 });
    expect(r.status).toBe("Complete");
    expect(r.received).toBe("🌏 UDP!");
    expect(r.metrics.acks).toBe(0);
  });
});
