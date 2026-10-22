import { Queue, random } from "./queue";
import {
  laboratory,
  longestPrefix,
  owner,
  routingTables,
  subnet,
  validateTopology,
} from "./topology";
import {
  defaults,
  type Config,
  type Device,
  type Event,
  type Frame,
  type Metrics,
  type Packet,
  type Result,
  type Tables,
  type Topology,
} from "./types";
const clone = <T>(v: T): T => structuredClone(v);
export function validateConfig(c: Config, t: Topology) {
  if (!c || typeof c !== "object")
    throw new Error("Scenario requires a configuration object.");
  if (
    typeof c.message !== "string" ||
    !new TextEncoder().encode(c.message).length ||
    new TextEncoder().encode(c.message).length > 512
  )
    throw new Error("Enter a message of 1–512 UTF-8 bytes.");
  if (
    !["TCP", "UDP"].includes(c.protocol) ||
    c.sender === c.receiver ||
    ![c.sender, c.receiver].every((id) =>
      t.devices.some((d) => d.id === id && d.kind === "host"),
    )
  )
    throw new Error("Choose two different computers.");
  for (const [v, min, max, label] of [
    [c.loss, 0, 1, "loss"],
    [c.ttl, 1, 64, "TTL"],
    [c.mss, 1, 64, "MSS"],
    [c.timeout, 100, 30000, "timeout"],
    [c.retries, 0, 8, "retry limit"],
    [c.seed, 0, 4294967295, "seed"],
  ] as const)
    if (
      !Number.isFinite(v) ||
      v < min ||
      v > max ||
      (label !== "loss" && !Number.isInteger(v))
    )
      throw new Error(`Invalid ${label}.`);
  if (
    typeof c.reorder !== "boolean" ||
    !Array.isArray(c.faults) ||
    c.faults.length > 40
  )
    throw new Error("Invalid fault settings.");
  for (const f of c.faults) {
    if (
      !f ||
      !Number.isFinite(f.time) ||
      f.time < 0 ||
      f.time > 120000 ||
      !["data", "ack", "link", "delay"].includes(f.kind)
    )
      throw new Error("Invalid timed fault.");
    if (
      ["link", "delay"].includes(f.kind) &&
      !t.links.some((l) => l.id === f.link)
    )
      throw new Error("Fault references an unknown link.");
    if (
      f.kind === "delay" &&
      (!Number.isFinite(f.value) || f.value! < 0 || f.value! > 2000)
    )
      throw new Error("Delay must be 0–2000 ms.");
  }
}
export function simulate(
  input: Partial<Config> = {},
  topology: Topology = laboratory(),
): Result {
  const c = { ...defaults, ...clone(input) },
    t = clone(topology);
  validateTopology(t);
  validateConfig(c, t);
  for (const d of t.devices)
    for (const i of d.interfaces) i.mac = i.mac.toLowerCase();
  const source = t.devices.find((d) => d.id === c.sender)!,
    dest = t.devices.find((d) => d.id === c.receiver)!;
  const q = new Queue(),
    rng = random(c.seed),
    events: Event[] = [],
    packets: Packet[] = [];
  const tables: Tables = { arp: {}, mac: {}, routes: routingTables(t) };
  for (const d of t.devices) {
    tables.arp[d.id] = {};
    tables.mac[d.id] = {};
  }
  const metrics: Metrics = {
    bytes: 0,
    data: 0,
    acks: 0,
    drops: 0,
    retransmissions: 0,
    completion: null,
  };
  const bytes = [...new TextEncoder().encode(c.message)],
    received: number[] = [],
    buffer = new Map<number, number[]>(),
    udp = new Map<number, number[]>();
  let now = 0,
    serial = 0,
    status = "Connecting",
    dropData = false,
    dropAck = false,
    expected = 1001,
    acked = 1001,
    established = false,
    started = false,
    synToken = 0;
  const linkEpoch = new Map(t.links.map((l) => [l.id, 0]));
  const pending = new Map<string, (() => void)[]>(),
    busy = new Map<string, number>(),
    waiting = new Map<string, number>();
  const emit = (
    kind: string,
    title: string,
    why: string,
    extra: Partial<Event> = {},
  ) => {
    events.push({
      id: `e${events.length + 1}`,
      time: now,
      kind,
      title,
      why,
      tables: clone(tables),
      metrics: clone(metrics),
      received: [...received],
      status,
      ...clone(extra),
    });
  };
  const schedule = (delay: number, fn: () => void) => q.add(now + delay, fn);
  const fail = (why: string) => {
    if (status === "Complete" || status === "Failed") return;
    status = "Failed";
    emit("failure", "Journey could not finish", why);
  };
  const drop = (
    title: string,
    why: string,
    frame: Frame,
    device?: string,
    link?: string,
  ) => {
    metrics.drops++;
    emit("drop", title, why, { frame, device, link });
  };
  const intf = (id: string) =>
    owner(t, id).interfaces.find((i) => i.id === id)!;
  const frameID = () => `f${++serial}`;
  function wire(from: string, frame: Frame) {
    const l = t.links.find((l) => l.a === from || l.b === from);
    const d = owner(t, from);
    if (!l || !l.up) {
      drop(
        "Disconnected port",
        "The outgoing Ethernet link is disabled or absent.",
        frame,
        d.id,
        l?.id,
      );
      return;
    }
    const to = l.a === from ? l.b : l.a,
      key = `${l.id}:${from}`;
    const count = waiting.get(key) || 0;
    if (count >= (l.capacity ?? 32)) {
      drop(
        "Queue full",
        "The simplified per-direction FIFO link queue has reached capacity.",
        frame,
        d.id,
        l.id,
      );
      return;
    }
    const size = frame.arp
      ? 64
      : Math.max(
          64,
          14 +
            20 +
            (frame.packet!.protocol === "TCP" ? 20 : 8) +
            frame.packet!.payload.length +
            (frame.packet!.protocol === "UDP" ? 4 : 0) +
            4,
        );
    const start = Math.max(now, busy.get(key) || 0),
      endTX = start + ((size * 8) / l.bandwidth) * 1000;
    busy.set(key, endTX);
    waiting.set(key, count + 1);
    if (start > now)
      emit(
        "queue",
        "Waiting for the cable",
        "Another frame is serializing. This direction uses a FIFO queue.",
        { frame, device: d.id, link: l.id },
      );
    q.add(start, () => {
      if (!l.up) {
        waiting.set(key, Math.max(0, (waiting.get(key) || 1) - 1));
        drop(
          "Disconnected queue",
          "The link was disabled before this queued frame could transmit.",
          frame,
          d.id,
          l.id,
        );
        return;
      }
      const epoch = linkEpoch.get(l.id);
      const p = frame.packet;
      let lost = false;
      if (p?.type === "DATA" && dropData) {
        dropData = false;
        lost = true;
      } else if (p?.type === "ACK" && dropAck) {
        dropAck = false;
        lost = true;
      } else if (p && rng() < c.loss) lost = true;
      const end = endTX + l.delay;
      emit(
        "transmit",
        `${frame.arp ? "ARP " + frame.arp.op : p!.type} → ${owner(t, to).name}`,
        `Serializing ${size} Ethernet bytes at ${l.bandwidth.toLocaleString()} bit/s, then ${l.delay} ms propagation.`,
        { frame, from: d.id, to: owner(t, to).id, link: l.id, end },
      );
      q.add(endTX, () =>
        waiting.set(key, Math.max(0, (waiting.get(key) || 1) - 1)),
      );
      q.add(end, () => {
        if (!l.up || linkEpoch.get(l.id) !== epoch) {
          drop(
            "Link failed in transit",
            "This frame was on a link when it was disabled.",
            frame,
            owner(t, to).id,
            l.id,
          );
          return;
        }
        if (lost) {
          drop(
            "Frame lost",
            `An armed one-shot fault or seeded per-link loss discarded this frame. ${p?.protocol === "TCP" ? "TCP must wait for its retransmission timer." : "UDP provides no automatic recovery."}`,
            frame,
            owner(t, to).id,
            l.id,
          );
          return;
        }
        receive(to, clone(frame));
      });
    });
  }
  function receive(at: string, f: Frame) {
    const d = owner(t, at),
      i = intf(at);
    emit(
      "arrive",
      `${f.arp ? "ARP" : f.packet!.type} at ${d.name}`,
      "The Ethernet frame arrived through the highlighted interface.",
      { frame: f, device: d.id },
    );
    if (d.kind === "switch") {
      tables.mac[d.id][f.src] = at;
      const known = tables.mac[d.id][f.dst];
      emit(
        "learn",
        `${d.name} learned a MAC`,
        `${f.src} is reachable through ${at}. ${known ? "Forward only through the learned destination port." : "Flood to other ports because the destination is broadcast or unknown."}`,
        { frame: f, device: d.id },
      );
      for (const out of d.interfaces.filter(
        (p) => p.id !== at && (!known || p.id === known),
      ))
        wire(out.id, clone(f));
      return;
    }
    if (f.dst !== i.mac && f.dst !== "ff:ff:ff:ff:ff:ff") return;
    if (f.arp) {
      const a = f.arp;
      tables.arp[d.id][a.senderIP] = a.senderMAC;
      const key = `${at}:${a.senderIP}`;
      const callbacks = pending.get(key);
      if (callbacks) {
        pending.delete(key);
        for (const cb of callbacks) cb();
      }
      emit(
        "arp",
        `${d.name} updated its ARP cache`,
        `${a.senderIP} maps to ${a.senderMAC}. ARP stays within this Ethernet segment.`,
        { frame: f, device: d.id },
      );
      if (a.op === "request" && a.targetIP === i.ip)
        wire(at, {
          id: frameID(),
          src: i.mac,
          dst: a.senderMAC,
          arp: {
            op: "reply",
            senderIP: i.ip!,
            senderMAC: i.mac,
            targetIP: a.senderIP,
          },
        });
      return;
    }
    const p = f.packet!;
    if (d.interfaces.some((i) => i.ip === p.dst)) {
      if (d.id === dest.id || d.id === source.id) transport(d, p, f);
      return;
    }
    if (d.kind === "router") {
      p.ttl--;
      if (p.ttl <= 0) {
        drop(
          "TTL expired",
          `${d.name} decremented TTL to zero. The IP packet is discarded. ICMP replies are outside this teaching model.`,
          f,
          d.id,
        );
        return;
      }
      emit(
        "route",
        `${d.name} forwards the packet`,
        "Longest-prefix matching chooses an output interface. IP endpoints stay the same; Ethernet addresses are rebuilt for the next segment. TTL decreased by one.",
        { frame: { ...f, packet: p }, device: d.id },
      );
      sendIP(d, p);
    }
  }
  function sendIP(d: Device, p: Packet) {
    const route = longestPrefix(tables.routes[d.id], p.dst);
    if (!route) {
      metrics.drops++;
      emit(
        "no-route",
        `No route at ${d.name}`,
        "No forwarding-table prefix matches this destination. A centralized Dijkstra recomputation cannot create connectivity where no path exists.",
        {
          device: d.id,
          frame: { id: frameID(), src: "—", dst: "—", packet: p },
        },
      );
      return;
    }
    const i = intf(route.interface),
      next = route.via || p.dst;
    if (subnet(next, i.prefix!) !== subnet(i.ip!, i.prefix!)) {
      metrics.drops++;
      emit(
        "no-route",
        "Next hop is off-link",
        "The selected next hop is not in the outgoing interface subnet.",
        { device: d.id },
      );
      return;
    }
    const transmit = () => {
      const mac = tables.arp[d.id][next];
      if (mac)
        wire(i.id, { id: frameID(), src: i.mac, dst: mac, packet: clone(p) });
    };
    if (tables.arp[d.id][next]) {
      transmit();
      return;
    }
    const key = `${i.id}:${next}`;
    if (pending.has(key)) {
      pending.get(key)!.push(transmit);
      return;
    }
    const requests = [transmit];
    pending.set(key, requests);
    emit(
      "arp",
      `${d.name} asks “who has ${next}?”`,
      d.kind === "host" && next !== p.dst
        ? "The receiver is on another subnet. Resolve the gateway’s MAC, not the remote computer’s MAC."
        : "Resolve the next-hop IPv4 address to a local Ethernet MAC.",
      { device: d.id },
    );
    wire(i.id, {
      id: frameID(),
      src: i.mac,
      dst: "ff:ff:ff:ff:ff:ff",
      arp: { op: "request", senderIP: i.ip!, senderMAC: i.mac, targetIP: next },
    });
    schedule(600, () => {
      if (pending.get(key) === requests) {
        pending.delete(key);
        metrics.drops += requests.length;
        emit(
          "arp-timeout",
          "ARP resolution timed out",
          "The pending frames were discarded. A TCP retry can issue a new ARP request.",
          { device: d.id },
        );
      }
    });
  }
  function make(
    type: Packet["type"],
    reverse = false,
    payload: number[] = [],
    seq = 1000,
    ack = 0,
    index = 0,
    attempt = 0,
  ): Packet {
    const p: Packet = {
      id: `p${++serial}`,
      type,
      protocol: c.protocol,
      src: (reverse ? dest : source).interfaces[0].ip!,
      dst: (reverse ? source : dest).interfaces[0].ip!,
      sport: reverse ? 8080 : 49152,
      dport: reverse ? 49152 : 8080,
      ttl: c.ttl,
      seq,
      ack,
      flags:
        type === "DATA"
          ? c.protocol === "TCP"
            ? "PSH, ACK"
            : "—"
          : type.replace("-", ", "),
      payload,
      index,
      total: Math.ceil(bytes.length / c.mss),
      attempt,
    };
    packets.push(clone(p));
    return p;
  }
  function launch(p: Packet, reverse = false) {
    if (status === "Failed") return;
    if (p.type === "DATA") {
      metrics.data++;
      if (p.attempt) metrics.retransmissions++;
    }
    if (p.type === "ACK") metrics.acks++;
    emit(
      "packet",
      `${p.type === "DATA" ? `Data ${p.index + 1}/${p.total}` : p.type} created`,
      p.type === "DATA"
        ? `${p.payload.length} application bytes; ${p.protocol === "TCP" ? `byte sequence ${p.seq}. SYN consumed sequence 1000.` : "index and total are application metadata, not UDP fields."}`
        : "Transport control packet enters the same routed network as application data.",
      {
        device: (reverse ? dest : source).id,
        frame: {
          id: frameID(),
          src: "pending ARP",
          dst: "pending ARP",
          packet: p,
        },
      },
    );
    sendIP(reverse ? dest : source, p);
  }
  const segments: {
    seq: number;
    data: number[];
    index: number;
    token: number;
    attempt: number;
  }[] = [];
  for (let offset = 0; offset < bytes.length; offset += c.mss)
    segments.push({
      seq: 1001 + offset,
      data: bytes.slice(offset, offset + c.mss),
      index: segments.length,
      token: 0,
      attempt: 0,
    });
  function sendSegment(s: (typeof segments)[number]) {
    if (
      s.seq + s.data.length <= acked ||
      status === "Failed" ||
      status === "Complete"
    )
      return;
    const token = ++s.token;
    launch(make("DATA", false, s.data, s.seq, 5001, s.index, s.attempt));
    schedule(c.timeout, () => {
      if (
        s.token !== token ||
        s.seq + s.data.length <= acked ||
        status === "Complete" ||
        status === "Failed"
      )
        return;
      if (s.attempt >= c.retries) {
        fail(
          "TCP exhausted its retry limit while waiting for a delivered cumulative ACK.",
        );
        return;
      }
      s.attempt++;
      emit(
        "timeout",
        `Retransmit sequence ${s.seq}`,
        "The segment’s timer expired without a delivered ACK covering its bytes. Duplicate data will not be delivered twice.",
      );
      sendSegment(s);
    });
  }
  function startData() {
    if (started || status === "Failed") return;
    started = true;
    status = "Sending";
    emit(
      "connected",
      "Sender ready to send data",
      "The sender received SYN-ACK and sent the final ACK. It can now send data without waiting to observe remote ACK receipt. Both SYNs consumed one byte of sequence space.",
    );
    segments.forEach((s, index) =>
      schedule(c.reorder && index === 0 ? 220 : index * 2, () =>
        sendSegment(s),
      ),
    );
  }
  function transport(d: Device, p: Packet, receivedFrame: Frame) {
    if (c.protocol === "UDP") {
      if (d.id !== dest.id || p.type !== "DATA") return;
      if (!udp.has(p.index)) {
        udp.set(p.index, p.payload);
        received.length = 0;
        for (let k = 0; k < segments.length; k++) {
          if (!udp.has(k)) break;
          received.push(...udp.get(k)!);
        }
        metrics.bytes = [...udp.values()].reduce((a, b) => a + b.length, 0);
      }
      emit(
        "deliver",
        `Datagram ${p.index + 1} received`,
        "The teaching application buffers by its own datagram index. UDP does not acknowledge, reorder, or retransmit. Decode only after all message bytes are reassembled.",
        {
          device: d.id,
          frame: receivedFrame,
        },
      );
      if (udp.size === segments.length) {
        status = "Complete";
        metrics.completion = now;
        emit(
          "complete",
          "Message reconstructed",
          "All application datagrams arrived; ordered UTF-8 bytes can now be decoded.",
        );
      }
      return;
    }
    if (d.id === dest.id) {
      if (p.type === "SYN") {
        launch(make("SYN-ACK", true, [], 5000, 1001), true);
        return;
      }
      if (p.type === "ACK" && p.ack === 5001) {
        if (!established) {
          established = true;
          emit(
            "connection",
            "Receiver connection established",
            "The final ACK reached the receiver through the modeled network.",
            { device: d.id },
          );
        }
        return;
      }
      if (p.type === "DATA" && p.ack === 5001) {
        if (!established) {
          established = true;
          emit(
            "connection",
            "Receiver connection established",
            "This data segment carries the ACK that completes the receiver’s handshake, even if the standalone ACK was lost.",
            { device: d.id },
          );
        }
        if (p.seq >= expected && !buffer.has(p.seq))
          buffer.set(p.seq, p.payload);
        const before = expected;
        while (buffer.has(expected)) {
          const part = buffer.get(expected)!;
          buffer.delete(expected);
          received.push(...part);
          expected += part.length;
        }
        metrics.bytes = received.length;
        emit(
          "deliver",
          expected > before
            ? `${received.length}/${bytes.length} bytes in order`
            : p.seq < expected
              ? "Duplicate data discarded"
              : "Out-of-order segment buffered",
          expected > before
            ? "Contiguous bytes were delivered exactly once. The cumulative ACK names the next expected byte."
            : "No new contiguous application bytes are available. Send the current cumulative ACK.",
          {
            device: d.id,
            frame: receivedFrame,
          },
        );
        launch(make("ACK", true, [], 5001, expected), true);
        return;
      }
    } else if (d.id === source.id) {
      if (p.type === "SYN-ACK" && p.ack === 1001) {
        synToken++;
        launch(make("ACK", false, [], 1001, 5001));
        startData();
        return;
      }
      if (p.type === "ACK") {
        acked = Math.max(acked, p.ack);
        emit(
          "ack",
          `Sender received ACK ${p.ack}`,
          "Only an ACK that has traversed the network can stop retransmission timers. Cumulative acknowledgement covers every earlier byte.",
          {
            device: d.id,
            frame: receivedFrame,
          },
        );
        if (
          acked >= 1001 + bytes.length &&
          established &&
          status !== "Complete" &&
          status !== "Failed"
        ) {
          status = "Complete";
          metrics.completion = now;
          emit(
            "complete",
            "Message delivered & acknowledged",
            "The receiver reconstructed the UTF-8 message and the sender received an ACK covering all application bytes.",
          );
        }
      }
    }
  }
  function syn(attempt = 0) {
    if (started || status === "Failed") return;
    const token = ++synToken;
    launch(make("SYN", false, [], 1000, 0, 0, attempt));
    schedule(c.timeout, () => {
      if (token !== synToken || started || status === "Failed") return;
      if (attempt >= c.retries) {
        fail(
          "TCP handshake retry limit reached. Check routing, TTL, link state, and loss.",
        );
        return;
      }
      metrics.retransmissions++;
      emit(
        "timeout",
        "Retry connection setup",
        "No SYN-ACK arrived before the sender’s handshake timer expired.",
      );
      syn(attempt + 1);
    });
  }
  for (const f of c.faults)
    q.add(f.time, () => {
      if (f.kind === "data") dropData = true;
      else if (f.kind === "ack") dropAck = true;
      else {
        const link = t.links.find((l) => l.id === f.link)!;
        if (f.kind === "link") {
          link.up = !link.up;
          if (!link.up)
            linkEpoch.set(link.id, (linkEpoch.get(link.id) || 0) + 1);
        } else link.delay = f.value!;
        tables.routes = routingTables(t);
      }
      emit(
        "fault",
        f.kind === "data"
          ? "Drop next data frame armed"
          : f.kind === "ack"
            ? "Drop next ACK frame armed"
            : f.kind === "link"
              ? `${f.link} link toggled`
              : `${f.link} delay changed`,
        ["link", "delay"].includes(f.kind)
          ? "Simplified centralized routing recomputed with Dijkstra. This is not a distributed routing protocol."
          : "This intervention has an explicit simulation timestamp. One-shot drops disarm after one eligible frame.",
        {
          link: f.link,
          linkState: f.link
            ? {
                up: t.links.find((l) => l.id === f.link)!.up,
                delay: t.links.find((l) => l.id === f.link)!.delay,
              }
            : undefined,
        },
      );
    });
  emit(
    "encode",
    `${bytes.length} UTF-8 bytes ready`,
    "Encode the whole message, then split bytes into small teaching segments. Reassemble bytes before decoding. OSI is an explanatory model, not seven mandatory headers.",
  );
  if (c.protocol === "TCP") q.add(1, () => syn());
  else {
    status = "Sending";
    segments.forEach((s, index) =>
      q.add(1 + (c.reorder && index === 0 ? 220 : index * 2), () =>
        launch(make("DATA", false, s.data, 0, 0, index)),
      ),
    );
  }
  let count = 0;
  while (q.size && count++ < 30000) {
    const job = q.pop();
    now = job.time;
    if (now > 120000) {
      fail("Simulation time limit reached.");
      break;
    }
    job.run();
  }
  if (status !== "Complete" && status !== "Failed")
    fail(
      c.protocol === "UDP"
        ? `Only ${udp.size}/${segments.length} datagrams arrived. UDP has no automatic recovery; incomplete messages are not decoded.`
        : "No complete acknowledged delivery. Check the event history.",
    );
  return {
    events,
    packets,
    received:
      metrics.bytes === bytes.length
        ? new TextDecoder().decode(new Uint8Array(received))
        : "",
    metrics: clone(metrics),
    status,
    topology: t,
  };
}
export function exportScenario(config: Config, topology: Topology) {
  return JSON.stringify({ version: 1, config, topology }, null, 2);
}
export function importScenario(text: string): {
  config: Config;
  topology: Topology;
} {
  if (text.length > 100000) throw new Error("Scenario file is too large.");
  const v = JSON.parse(text);
  if (!v || typeof v !== "object" || Array.isArray(v) || v.version !== 1)
    throw new Error("Expected PacketVerse scenario version 1.");
  validateTopology(v.topology);
  validateConfig(v.config, v.topology);
  return { config: v.config, topology: v.topology };
}
