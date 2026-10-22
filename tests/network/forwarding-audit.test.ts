import { it, expect } from "vitest";
import { simulate } from "../../src/network/simulation";
import { defaults, type Event } from "../../src/network/types";
import { owner } from "../../src/network/topology";
import { scenarios } from "../../src/scenarios/network";

it("preserves IP, rebuilds MAC and handles TTL on both directions of every preset", () => {
  let transmissions = 0;
  for (const scenario of scenarios) for (const sender of ["a", "b"]) {
    const config = { ...defaults, ...scenario.config, sender, receiver: sender === "a" ? "b" : "a" };
    const result = simulate(config);
    const fails = ["udp", "no-route", "ttl"].includes(scenario.id);
    expect(result.status, `${scenario.id}: ${sender}`).toBe(fails ? "Failed" : "Complete");
    if (!fails) expect(result.received).toBe(config.message);
    const origin = result.topology.devices.find(d => d.id === config.sender)!.interfaces[0].ip;
    const target = result.topology.devices.find(d => d.id === config.receiver)!.interfaces[0].ip;
    const previous = new Map<string, Event>();
    for (const event of result.events) {
      if (event.kind !== "transmit") continue;
      transmissions++;
      const link = result.topology.links.find(l => l.id === event.link)!;
      expect(link).toBeDefined();
      const a = owner(result.topology, link.a), b = owner(result.topology, link.b);
      expect((event.from === a.id && event.to === b.id) || (event.from === b.id && event.to === a.id)).toBe(true);
      expect(event.end!).toBeGreaterThan(event.time);
      const frame = event.frame!, packet = frame.packet;
      if (!packet) continue;
      expect(packet.ttl).toBeGreaterThan(0);
      expect((packet.src === origin && packet.dst === target) || (packet.src === target && packet.dst === origin)).toBe(true);
      const prior = previous.get(frame.id);
      if (prior) {
        expect(packet.ttl).toBe(prior.frame!.packet!.ttl);
        expect(frame.src).toBe(prior.frame!.src);
        expect(frame.dst).toBe(prior.frame!.dst);
      } else {
        const device = result.topology.devices.find(d => d.id === event.from)!;
        const outgoing = device.interfaces.find(i => i.id === link.a || i.id === link.b)!;
        expect(frame.src).toBe(outgoing.mac);
        if (device.kind === "router") expect(packet.ttl).toBeLessThan(config.ttl);
      }
      previous.set(frame.id, event);
    }
  }
  expect(transmissions).toBeGreaterThan(700);
});
