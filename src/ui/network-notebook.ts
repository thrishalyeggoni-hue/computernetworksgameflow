import type { Config, Device, Event, Topology } from "../network/types";
export const escape = (v: unknown) =>
  String(v ?? "—").replace(
    /[&<>"']/g,
    (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        ch
      ]!,
  );
export const tabs = [
  "Journey",
  "Encapsulation",
  "Packet Fields",
  "Routing Tables",
  "MAC Tables",
  "ARP Cache",
  "TCP Timeline",
  "Metrics",
  "Why This Happened",
];
const row = (a: string, b: unknown) =>
  `<div class="field"><span>${escape(a)}</span><code>${escape(b)}</code></div>`;
const table = (heads: string[], rows: unknown[][]) =>
  `<div class="table-scroll"><table><thead><tr>${heads.map((h) => `<th>${escape(h)}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((v) => `<td>${escape(v)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
export function notebook(
  tab: string,
  event: Event | undefined,
  config: Config,
  topology: Topology,
  device: Device | undefined,
  visible: Event[],
): string {
  const p = event?.frame?.packet,
    f = event?.frame,
    t = event?.tables;
  if (tab === "Journey") {
    if (device) {
      return `<div class="tiny-label">DEVICE INSPECTOR</div><h3>${escape(device.name)}</h3><span class="pill">${escape(device.kind.toUpperCase())}</span><p>${device.kind === "router" ? "Connects different subnets. Chooses a route, decrements TTL, and rebuilds the Ethernet frame." : device.kind === "switch" ? "Learns the source MAC on each incoming port. Forwards known destinations and floods unknown ones." : "Encodes or reconstructs application bytes. Uses ARP to resolve a local next hop."}</p>${device.interfaces.map((i) => `<div class="interface-card">${row("Port", i.id)}${i.ip ? row("IPv4", `${i.ip}/${i.prefix}`) : ""}${row("MAC", i.mac)}</div>`).join("")}<p class="note">Open the table pages to inspect this run’s learned state.</p>`;
    }
    if (!event)
      return `<div class="notebook-illustration"><div class="envelope">↗</div><span class="orbit one">01</span><span class="orbit two">ACK</span></div><div class="tiny-label">A FIELD GUIDE TO THE INTERNET</div><h3>Follow a little packet.<br>Discover a big idea.</h3><p>Send your first message, then click a packet or device to see what happens inside.</p><div class="note">✦ Start curious. Break a cable. See what happens.</div><div class="notebook-rule"></div><div class="tiny-label">TODAY’S EXPERIMENT</div><p>Can two computers share a message across different networks?</p>`;
    return `<div class="tiny-label">${escape(event.kind.toUpperCase())} · ${event.time.toFixed(1)} ms</div><h3>${escape(event.title)}</h3><p>${escape(event.why)}</p>${p ? `<div class="packet-card ${p.protocol === "UDP" ? "purple" : ""}"><span>${escape(p.type)}</span><strong>${p.type === "DATA" ? `#${p.index + 1}` : "↗"}</strong><small>${escape(p.id)} · ${p.payload.length} bytes</small></div>${row("From", p.src)}${row("To", p.dst)}${row("At device", event.device ?? event.from ?? "in transit")}` : ""}<div class="note">Next: ${event.kind === "transmit" ? "the frame reaches the other end of the cable." : event.kind === "drop" ? "TCP waits for an ACK or its retransmission timer; UDP does not retry." : event.kind === "complete" ? "try a different protocol or introduce a fault." : "follow the next event in the timeline."}</div>`;
  }
  if (tab === "Encapsulation") {
    const n = new TextEncoder().encode(config.message);
    return `<div class="tiny-label">WORDS → BYTES → FRAMES</div><h3>A message gets an envelope.</h3><p>Each real protocol adds the fields it needs. The seven OSI layers help explain their roles.</p>${[
      ["7", "Application", `${n.length} UTF-8 bytes · your message`],
      ["6", "Presentation", "UTF-8 encoding; no extra modeled header"],
      ["5", "Session", "Application conversation; no extra header"],
      [
        "4",
        "Transport",
        `${config.protocol} · ${config.protocol === "TCP" ? "20-byte teaching header" : "8-byte header"}`,
      ],
      ["3", "Network", "IPv4 · 20-byte header · end-to-end IPs"],
      ["2", "Data link", "Ethernet · 14-byte header + 4-byte FCS"],
      ["1", "Physical", "Bits serialized onto each cable"],
    ]
      .map(
        ([num, title, detail]) =>
          `<div class="layer layer-${num}"><b>${num}</b><div><strong>${title}</strong><small>${escape(detail)}</small></div></div>`,
      )
      .join(
        "",
      )}<h4>The actual bytes</h4><div class="byte-grid">${[...n].map((b) => `<code>${b.toString(16).padStart(2, "0").toUpperCase()}</code>`).join("")}</div><p class="note">The final message is decoded only after reassembling bytes. UDP index metadata belongs to this teaching application.</p>`;
  }
  if (tab === "Packet Fields") {
    if (!f)
      return "<h3>Select a packet.</h3><p>Click a traveling parcel, an event, or a packet in the accessible list. Selection stays fixed while playback continues.</p>";
    return `<div class="tiny-label">${escape(p?.id ?? f.id)} · ACTUAL EVENT STATE</div><h3>Inside the envelope</h3>${row("Event time", `${event!.time.toFixed(2)} ms`)}<h4>Ethernet</h4>${row("Source MAC", f.src === "pending ARP" ? "Not framed yet" : f.src)}${row("Destination MAC", f.dst === "pending ARP" ? "Pending next-hop resolution" : f.dst)}${f.arp ? `<h4>ARP ${escape(f.arp.op)}</h4>${row("Sender IP", f.arp.senderIP)}${row("Target IP", f.arp.targetIP)}` : ""}${p ? `<h4>IPv4</h4>${row("Source", p.src)}${row("Destination", p.dst)}${row("TTL", p.ttl)}${row("Protocol", p.protocol)}<h4>${escape(p.protocol)}</h4>${row("Source port", p.sport)}${row("Destination port", p.dport)}${p.protocol === "TCP" ? `${row("Sequence", p.seq)}${row("Acknowledgement", p.ack)}${row("Flags", p.flags)}` : row("UDP length", 8 + p.payload.length + 4)}${row("Payload bytes", p.payload.length)}${row("Attempt", p.attempt + 1)}${p.type === "DATA" ? row("App chunk", `${p.index + 1} / ${p.total}`) : ""}<div class="byte-grid">${p.payload.map((b) => `<code>${b.toString(16).padStart(2, "0")}</code>`).join("")}</div><p class="note">Payload bytes may split a UTF-8 character. Decode the reconstructed message, not each segment.</p>` : ""}`;
  }
  if (["Routing Tables", "MAC Tables", "ARP Cache"].includes(tab)) {
    if (!t)
      return "<h3>Waiting for a journey.</h3><p>Send a message to inspect live forwarding and learned tables.</p>";
    const devices = device ? [device] : topology.devices;
    return `<div class="tiny-label">SNAPSHOT · ${event!.time.toFixed(1)} ms</div><h3>${escape(tab)}</h3><p>${tab === "Routing Tables" ? "Longest prefix wins. Routes use a simplified centralized Dijkstra computation." : tab === "MAC Tables" ? "Switches learn the source MAC on incoming ports." : "ARP maps a next-hop IP to its local MAC. Remote MACs never cross routers."}</p>${
      devices
        .filter((d) =>
          tab === "MAC Tables" ? d.kind === "switch" : d.kind !== "switch",
        )
        .map(
          (d) =>
            `<h4>${escape(d.name)}</h4>${
              tab === "Routing Tables"
                ? table(
                    ["Prefix", "Via / direct", "Port"],
                    (t.routes[d.id] ?? []).map((r) => [
                      `${r.prefix}/${r.length}`,
                      r.via ?? "connected",
                      r.interface,
                    ]),
                  )
                : table(
                    tab === "MAC Tables" ? ["MAC", "Port"] : ["IPv4", "MAC"],
                    Object.entries(
                      (tab === "MAC Tables" ? t.mac : t.arp)[d.id] ?? {},
                    ),
                  )
            }`,
        )
        .join("") || "<p>No table of this type for the selected device.</p>"
    }`;
  }
  if (tab === "TCP Timeline") {
    return `<div class="tiny-label">TRANSPORT DIARY</div><h3>The conversation</h3><p>TCP sequence numbers count bytes. SYN consumes one sequence number. ACKs travel through every intervening hop.</p>${
      config.protocol === "UDP"
        ? '<div class="note">UDP has no transport handshake, acknowledgements, or retransmission timers.</div>'
        : visible
            .filter(
              (e) =>
                ["connected", "connection", "ack", "timeout"].includes(
                  e.kind,
                ) ||
                (e.kind === "packet" && e.frame?.packet?.type !== "DATA"),
            )
            .slice(-30)
            .map(
              (e) =>
                `<div class="diary"><small>${e.time.toFixed(1)} ms</small><strong>${escape(e.title)}</strong><p>${escape(e.why)}</p></div>`,
            )
            .join("") || "<p>No transport events yet.</p>"
    }`;
  }
  if (tab === "Metrics") {
    const m = event?.metrics;
    return `<div class="tiny-label">MEASURED IN THIS SIMULATION</div><h3>The journey, in numbers</h3>${m ? `${row("Unique application bytes", m.bytes)}${row("Data transmissions", m.data)}${row("ACK transmissions", m.acks)}${row("Dropped frames / packets", m.drops)}${row("Retransmissions", m.retransmissions)}${row("Completion", m.completion === null ? "pending" : `${m.completion.toFixed(2)} ms`)}${row("Application goodput", m.completion ? `${(m.bytes / (m.completion / 1000)).toFixed(1)} B/s` : "pending")}<p class="note">Goodput = unique delivered application bytes ÷ full simulated completion interval, including setup and ARP. Packet transmissions count transport launches, not each Ethernet hop. Drops include discarded Ethernet frames, unroutable IP packets, and expired ARP pending packets. Frame serialization includes padding and overhead; these are teaching measurements.</p>` : "<p>Send a message to calculate measurements.</p>"}`;
  }
  return `<div class="tiny-label">CAUSE → EFFECT</div><h3>${escape(event?.title ?? "Ask “why?”")}</h3><p>${escape(event?.why ?? "Every event has an explanation. Select one from the timeline after sending a message.")}</p><h4>What changed?</h4><p>${event?.kind === "route" ? "TTL decreased by one. The next Ethernet frame uses the router’s outgoing MAC and the next hop’s MAC. Source and destination IPs remain unchanged." : event?.kind === "learn" ? "The switch associated the frame’s source MAC with its incoming port." : event?.kind === "arp" ? "An ARP request or reply resolves a next hop on the local Ethernet segment." : event?.kind === "ack" ? "The sender’s acknowledged byte boundary advances only when this cumulative ACK arrives." : event?.kind === "fault" ? "The timed intervention changed a link, its delay, or the next eligible frame’s loss condition." : event?.kind === "deliver" ? "The receiver buffered or delivered bytes. Duplicate bytes do not increase application delivery." : "Review packet fields and the table snapshots for this exact event."}</p><div class="note">TCP here is an educational subset: no congestion control, full flow control, connection teardown, or RFC compliance claim.</div>`;
}

const plainTerms:Record<string,[string,string][]>={
 'Journey':[['Packet','A small parcel carrying part of a message.'],['Hop','One move from one device to the next.'],['ACK','A receipt saying which bytes arrived.']],
 'Encapsulation':[['Payload','The contents inside a delivery wrapper.'],['Header','A label added before those contents.'],['Encapsulation','Putting one layer’s parcel inside the next layer’s wrapper.']],
 'Packet Fields':[['IP address','The network address used to reach a computer.'],['MAC address','The local-link label used to reach the next device.'],['Port number','The label that selects an app inside a computer.'],['Sequence / ACK','Byte numbers used to track delivery and receipts.']],
 'Routing Tables':[['Route','Directions for reaching a destination network.'],['Next hop','The next device the parcel should visit.'],['Longest prefix','The most specific matching network address wins.']],
 'MAC Tables':[['MAC table','A switch’s address book: which cable port leads to which device.'],['Learning','The switch remembers where a sender’s frame came from.'],['Flooding','An unknown destination is sent out other eligible ports.']],
 'ARP Cache':[['ARP','Asking “who has this local IP address?” to find its MAC label.'],['Cache','A saved answer that can be reused.'],['Next hop','The local neighbour, often a router, that receives the next frame.']],
 'TCP Timeline':[['Handshake','A short “ready?” exchange before TCP sends your message.'],['ACK','A receipt naming the next byte the receiver expects.'],['Retransmission','Sending missing data again after a timeout.']],
 'Metrics':[['Goodput','Useful message bytes received per second in this simulated journey.'],['Retransmissions','Extra sends needed when delivery receipts are missing.'],['Completion','How long this simulated journey took, including setup.']],
 'Why This Happened':[['Event','One action recorded in the journey.'],['Snapshot','What the network knew at that point in time.'],['Fault','A deliberate lost frame, broken cable, or extra delay.']],
};
export function notebookPlainGuide(tab:string){return `<details class="notebook-plain-guide"><summary>What do these words mean?</summary><dl>${(plainTerms[tab]??plainTerms.Journey).map(([term,meaning])=>`<dt>${escape(term)}</dt><dd>${escape(meaning)}</dd>`).join('')}</dl></details>`;}
