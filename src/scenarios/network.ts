import type { Config, Result } from "../network/types";
export const scenarios = [
  {
    id: "delivery",
    name: "The first hello",
    description: "One message. Two computers. A whole world in between.",
    config: {},
  },
  {
    id: "loss",
    name: "A parcel goes missing",
    description: "Drop one data frame and watch TCP recover.",
    config: { faults: [{ time: 0, kind: "data" }] },
  },
  {
    id: "ack",
    name: "The missing receipt",
    description: "Lose a data ACK; see duplicates discarded safely.",
    config: { message: "Hello!", faults: [{ time: 650, kind: "ack" }] },
  },
  {
    id: "udp",
    name: "Taking the express lane",
    description: "UDP makes no delivery promise. Drop one datagram.",
    config: { protocol: "UDP", faults: [{ time: 0, kind: "data" }] },
  },
  {
    id: "reroute",
    name: "The scenic route",
    description: "Disable the direct cable. Router 3 takes over.",
    config: { faults: [{ time: 0, kind: "link", link: "l3" }] },
  },
  {
    id: "no-route",
    name: "An island in the network",
    description: "Break both routed paths and inspect the failure.",
    config: {
      faults: [
        { time: 0, kind: "link", link: "l3" },
        { time: 0, kind: "link", link: "l6" },
      ],
    },
  },
  {
    id: "reorder",
    name: "Out of order, in good hands",
    description: "Delay the first segment. TCP buffers the rest.",
    config: { reorder: true, message: "Packets take different journeys." },
  },
  {
    id: "ttl",
    name: "A packet with a short life",
    description: "A TTL of one expires at the first router.",
    config: { ttl: 1 },
  },
  {
    id: "delay",
    name: "A slower stretch of cable",
    description: "Increase propagation delay on the primary route.",
    config: { faults: [{ time: 0, kind: "delay", link: "l3", value: 180 }] },
  },
] satisfies {
  id: string;
  name: string;
  description: string;
  config: Partial<Config>;
}[];
export const chapters = [
  {
    title: "Message to Bytes",
    subtitle: "Your words, in a new language",
    icon: "01",
    scenario: "delivery",
    objective: "Deliver a message and inspect its UTF-8 bytes.",
  },
  {
    title: "A Local Introduction",
    subtitle: "Ethernet · MAC learning · ARP",
    icon: "02",
    scenario: "delivery",
    objective: "Inspect ARP and MAC tables after a successful delivery.",
  },
  {
    title: "Beyond the Neighborhood",
    subtitle: "IP addresses & routing",
    icon: "03",
    scenario: "reroute",
    objective: "Deliver through Router 3 after the primary link fails.",
  },
  {
    title: "A Reliable Conversation",
    subtitle: "TCP & the three-way handshake",
    icon: "04",
    scenario: "loss",
    objective: "Recover a lost data frame and deliver the full message.",
  },
  {
    title: "No Promises, Just Packets",
    subtitle: "UDP & application datagrams",
    icon: "05",
    scenario: "udp",
    objective: "Observe a missing UDP datagram with no automatic retry.",
  },
  {
    title: "The Road Back",
    subtitle: "Failures, recovery & rerouting",
    icon: "06",
    scenario: "no-route",
    objective: "Explain a no-route failure using the forwarding table.",
  },
];
export function challengePassed(index: number, r: Result, viewed: Set<string>) {
  switch (index) {
    case 0:
      return r.status === "Complete" && viewed.has("Encapsulation");
    case 1:
      return (
        r.status === "Complete" &&
        viewed.has("ARP Cache") &&
        viewed.has("MAC Tables")
      );
    case 2:
      return (
        r.status === "Complete" &&
        r.events.some((e) => e.kind === "transmit" && e.link === "l6")
      );
    case 3:
      return (
        r.status === "Complete" &&
        r.metrics.drops > 0 &&
        r.metrics.retransmissions > 0
      );
    case 4:
      return (
        r.status === "Failed" &&
        r.metrics.drops > 0 &&
        r.metrics.retransmissions === 0 &&
        r.packets[0]?.protocol === "UDP"
      );
    case 5:
      return (
        r.status === "Failed" &&
        viewed.has("Routing Tables") &&
        r.events.some((e) => e.kind === "no-route")
      );
    default:
      return false;
  }
}
