import type { Device, Interface, Link, Route, Topology } from "./types";
export function laboratory(): Topology {
  let n = 0;
  const i = (id: string, ip?: string, prefix = 24): Interface => ({
    id,
    ip,
    prefix,
    mac: `02:00:00:00:00:${(++n).toString(16).padStart(2, "0")}`,
  });
  const devices: Device[] = [
    {
      id: "a",
      name: "Computer A",
      kind: "host",
      x: 140,
      y: 340,
      gateway: "192.168.1.1",
      interfaces: [i("a0", "192.168.1.10")],
    },
    {
      id: "s1",
      name: "Switch A",
      kind: "switch",
      x: 285,
      y: 250,
      interfaces: [i("s1a"), i("s1b")],
    },
    {
      id: "r1",
      name: "Router 1",
      kind: "router",
      x: 430,
      y: 320,
      interfaces: [
        i("r1a", "192.168.1.1"),
        i("r1b", "10.0.0.1", 30),
        i("r1c", "10.0.0.5", 30),
      ],
    },
    {
      id: "r2",
      name: "Router 2",
      kind: "router",
      x: 670,
      y: 250,
      interfaces: [
        i("r2a", "10.0.0.2", 30),
        i("r2b", "192.168.2.1"),
        i("r2c", "10.0.0.10", 30),
      ],
    },
    {
      id: "s2",
      name: "Switch B",
      kind: "switch",
      x: 815,
      y: 340,
      interfaces: [i("s2a"), i("s2b")],
    },
    {
      id: "b",
      name: "Computer B",
      kind: "host",
      x: 960,
      y: 250,
      gateway: "192.168.2.1",
      interfaces: [i("b0", "192.168.2.20")],
    },
    {
      id: "r3",
      name: "Router 3",
      kind: "router",
      x: 550,
      y: 125,
      interfaces: [i("r3a", "10.0.0.6", 30), i("r3b", "10.0.0.9", 30)],
    },
  ];
  const link = (id: string, a: string, b: string, delay = 12): Link => ({
    id,
    a,
    b,
    delay,
    bandwidth: 64000,
    up: true,
    capacity: 32,
  });
  return {
    devices,
    links: [
      link("l1", "a0", "s1a"),
      link("l2", "s1b", "r1a"),
      link("l3", "r1b", "r2a", 35),
      link("l4", "r2b", "s2a"),
      link("l5", "s2b", "b0"),
      link("l6", "r1c", "r3a", 30),
      link("l7", "r3b", "r2c", 30),
    ],
  };
}
export function ipv4(ip: string): number {
  if (typeof ip !== "string")
    throw new Error("Invalid IPv4 address: expected a string.");
  const p = ip.split(".");
  if (
    p.length !== 4 ||
    p.some((v) => !/^(0|[1-9]\d{0,2})$/.test(v) || +v > 255)
  )
    throw new Error(`Invalid IPv4 address: ${ip}`);
  return p.reduce((a, v) => (a * 256 + Number(v)) >>> 0, 0);
}
export function subnet(ip: string, length: number): string {
  const n = ipv4(ip) & (length === 0 ? 0 : 0xffffffff << (32 - length));
  return [24, 16, 8, 0].map((s) => (n >>> s) & 255).join(".");
}
export function longestPrefix(routes: Route[], ip: string): Route | undefined {
  ipv4(ip);
  return routes
    .filter((r) => subnet(ip, r.length) === subnet(r.prefix, r.length))
    .sort((a, b) => b.length - a.length || a.cost - b.cost)[0];
}
export function owner(t: Topology, id: string): Device {
  const d = t.devices.find((d) => d.interfaces.some((i) => i.id === id));
  if (!d) throw new Error(`Unknown interface ${id}`);
  return d;
}
/** Preserve link identity so parallel cables can have different costs. Hosts never forward transit traffic. */
function shortestLinks(
  t: Topology,
  start: string,
  end: string,
): Link[] | undefined {
  if (
    !t.devices.some((d) => d.id === start) ||
    !t.devices.some((d) => d.id === end)
  )
    return undefined;
  const dist = new Map(t.devices.map((d) => [d.id, Infinity])),
    prev = new Map<string, { device: string; link: Link }>(),
    todo = new Set(dist.keys());
  dist.set(start, 0);
  while (todo.size) {
    const u = [...todo].sort(
      (a, b) => dist.get(a)! - dist.get(b)! || a.localeCompare(b),
    )[0];
    todo.delete(u);
    if (!Number.isFinite(dist.get(u))) break;
    if (u === end) break;
    if (u !== start && t.devices.find((d) => d.id === u)!.kind === "host")
      continue;
    for (const l of t.links.filter((l) => l.up)) {
      const a = owner(t, l.a).id,
        b = owner(t, l.b).id,
        v = a === u ? b : b === u ? a : undefined;
      if (!v || !todo.has(v)) continue;
      const cost = dist.get(u)! + linkCost(l);
      if (cost < dist.get(v)!) {
        dist.set(v, cost);
        prev.set(v, { device: u, link: l });
      }
    }
  }
  if (!Number.isFinite(dist.get(end))) return undefined;
  const links: Link[] = [];
  let node = end;
  while (node !== start) {
    const p = prev.get(node);
    if (!p) return undefined;
    links.unshift(p.link);
    node = p.device;
  }
  return links;
}
const linkCost = (l: Link) => l.delay + ((64 * 8) / l.bandwidth) * 1000;
export function shortestPath(
  t: Topology,
  start: string,
  end: string,
): string[] {
  const links = shortestLinks(t, start, end);
  if (!links) return [];
  const path = [start];
  for (const l of links)
    path.push(
      owner(t, l.a).id === path.at(-1) ? owner(t, l.b).id : owner(t, l.a).id,
    );
  return path;
}
export function routingTables(t: Topology): Record<string, Route[]> {
  const all: Record<string, Route[]> = {};
  for (const d of t.devices.filter((d) => d.kind !== "switch")) {
    const routes: Route[] = [];
    for (const i of d.interfaces.filter(
      (i) =>
        i.ip && t.links.some((l) => l.up && (l.a === i.id || l.b === i.id)),
    ))
      routes.push({
        prefix: subnet(i.ip!, i.prefix!),
        length: i.prefix!,
        interface: i.id,
        cost: 0,
      });
    if (d.kind === "host") {
      routes.push({
        prefix: "0.0.0.0",
        length: 0,
        via: d.gateway,
        interface: d.interfaces[0].id,
        cost: 1,
      });
    } else
      for (const target of t.devices.filter(
        (x) => x.id !== d.id && x.kind !== "switch",
      )) {
        const links = shortestLinks(t, d.id, target.id);
        if (!links?.length) continue;
        const first = links[0],
          out = owner(t, first.a).id === d.id ? first.a : first.b;
        const outgoing = d.interfaces.find((i) => i.id === out)!;
        let current = d.id,
          via: string | undefined;
        for (const link of links) {
          const incoming = owner(t, link.a).id === current ? link.b : link.a;
          const next = owner(t, incoming);
          current = next.id;
          if (next.kind !== "switch") {
            via = next.interfaces.find((i) => i.id === incoming)?.ip;
            break;
          }
        }
        if (
          !via ||
          subnet(via, outgoing.prefix!) !==
            subnet(outgoing.ip!, outgoing.prefix!)
        )
          continue;
        const cost = links.reduce((sum, l) => sum + linkCost(l), 0);
        for (const ti of target.interfaces.filter(
          (i) =>
            i.ip && t.links.some((l) => l.up && (l.a === i.id || l.b === i.id)),
        )) {
          const prefix = subnet(ti.ip!, ti.prefix!),
            existing = routes.find(
              (r) => r.prefix === prefix && r.length === ti.prefix,
            );
          if (existing && existing.cost <= cost) continue;
          const route = {
            prefix,
            length: ti.prefix!,
            via,
            interface: out,
            cost,
          };
          if (existing) routes[routes.indexOf(existing)] = route;
          else routes.push(route);
        }
      }
    all[d.id] = routes;
  }
  return all;
}
export function validateTopology(t: Topology): void {
  if (
    !t ||
    !Array.isArray(t.devices) ||
    !Array.isArray(t.links) ||
    t.devices.length < 2 ||
    t.devices.length > 24 ||
    t.links.length > 48
  )
    throw new Error("Topology must contain 2–24 devices and at most 48 links.");
  const validID = (id: unknown) =>
    typeof id === "string" &&
    /^[a-zA-Z][a-zA-Z0-9_-]{0,40}$/.test(id) &&
    !["constructor", "prototype", "__proto__"].includes(id);
  const ids = new Set<string>(),
    ints = new Set<string>(),
    ips = new Set<string>(),
    macs = new Set<string>();
  for (const d of t.devices) {
    if (
      !d ||
      !validID(d.id) ||
      ids.has(d.id) ||
      !["host", "switch", "router"].includes(d.kind) ||
      typeof d.name !== "string" ||
      d.name.length > 80 ||
      !Number.isFinite(d.x) ||
      !Number.isFinite(d.y) ||
      d.x < 60 ||
      d.x > 1040 ||
      d.y < 70 ||
      d.y > 470 ||
      !Array.isArray(d.interfaces) ||
      !d.interfaces.length ||
      d.interfaces.length > 16
    )
      throw new Error("Invalid or duplicate device, position, or interfaces.");
    ids.add(d.id);
    for (const i of d.interfaces) {
      if (
        !i ||
        !validID(i.id) ||
        ints.has(i.id) ||
        typeof i.mac !== "string" ||
        !/^([0-9a-f]{2}:){5}[0-9a-f]{2}$/i.test(i.mac) ||
        macs.has(i.mac.toLowerCase()) ||
        (parseInt(i.mac.slice(0, 2), 16) & 1) !== 0 ||
        i.mac.toLowerCase() === "00:00:00:00:00:00"
      )
        throw new Error("Invalid or duplicate interface or MAC.");
      ints.add(i.id);
      macs.add(i.mac.toLowerCase());
      if (i.ip) {
        ipv4(i.ip);
        if (
          ips.has(i.ip) ||
          !Number.isInteger(i.prefix) ||
          i.prefix! < 1 ||
          i.prefix! > 32
        )
          throw new Error("Duplicate IP or invalid subnet prefix.");
        ips.add(i.ip);
      }
    }
    if (d.kind === "host" && d.interfaces.length !== 1)
      throw new Error(
        "This model supports one interface per host; use routers for transit forwarding.",
      );
    if (d.kind !== "switch" && !d.interfaces.every((i) => i.ip))
      throw new Error("Hosts and routers need addressed interfaces.");
    if (
      d.kind === "host" &&
      (!d.gateway ||
        !d.interfaces.some(
          (i) => subnet(i.ip!, i.prefix!) === subnet(d.gateway!, i.prefix!),
        ))
    )
      throw new Error("Host gateway must be in its local subnet.");
  }
  const used = new Set<string>(),
    lids = new Set<string>();
  for (const l of t.links) {
    if (
      !l ||
      !validID(l.id) ||
      lids.has(l.id) ||
      !ints.has(l.a) ||
      !ints.has(l.b) ||
      l.a === l.b ||
      owner(t, l.a).id === owner(t, l.b).id ||
      used.has(l.a) ||
      used.has(l.b) ||
      !Number.isFinite(l.bandwidth) ||
      l.bandwidth < 1000 ||
      l.bandwidth > 1e9 ||
      !Number.isFinite(l.delay) ||
      l.delay < 0 ||
      l.delay > 2000 ||
      typeof l.up !== "boolean" ||
      (l.capacity !== undefined &&
        (!Number.isInteger(l.capacity) || l.capacity < 1 || l.capacity > 256))
    )
      throw new Error(
        "Invalid link, bandwidth, delay, capacity, or occupied port.",
      );
    lids.add(l.id);
    used.add(l.a);
    used.add(l.b);
  }
  // Reject L2 loops: union interface owners through switches, but stop at router/host ports.
  const parent = new Map<string, string>();
  const root = (x: string): string => {
    if (!parent.has(x)) parent.set(x, x);
    const p = parent.get(x)!;
    return p === x ? x : root(p);
  };
  for (const l of t.links) {
    const key = (i: string) =>
      owner(t, i).kind === "switch"
        ? `switch:${owner(t, i).id}`
        : `interface:${i}`;
    const a = root(key(l.a)),
      b = root(key(l.b));
    if (a === b)
      throw new Error("Layer 2 loop detected; spanning tree is not modeled.");
    parent.set(a, b);
  }
}
