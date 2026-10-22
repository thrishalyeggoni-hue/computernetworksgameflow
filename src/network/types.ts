export type Kind = "host" | "switch" | "router";
export interface Interface {
  id: string;
  ip?: string;
  prefix?: number;
  mac: string;
}
export interface Device {
  id: string;
  name: string;
  kind: Kind;
  x: number;
  y: number;
  interfaces: Interface[];
  gateway?: string;
}
export interface Link {
  id: string;
  a: string;
  b: string;
  bandwidth: number;
  delay: number;
  up: boolean;
  capacity?: number;
}
export interface Topology {
  devices: Device[];
  links: Link[];
}
export interface Route {
  prefix: string;
  length: number;
  via?: string;
  interface: string;
  cost: number;
}
export type Protocol = "TCP" | "UDP";
export interface Packet {
  id: string;
  type: "SYN" | "SYN-ACK" | "ACK" | "DATA";
  protocol: Protocol;
  src: string;
  dst: string;
  sport: number;
  dport: number;
  ttl: number;
  seq: number;
  ack: number;
  flags: string;
  payload: number[];
  index: number;
  total: number;
  attempt: number;
}
export interface Frame {
  id: string;
  src: string;
  dst: string;
  packet?: Packet;
  arp?: {
    op: "request" | "reply";
    senderIP: string;
    senderMAC: string;
    targetIP: string;
  };
}
export interface Tables {
  arp: Record<string, Record<string, string>>;
  mac: Record<string, Record<string, string>>;
  routes: Record<string, Route[]>;
}
export interface Metrics {
  bytes: number;
  data: number;
  acks: number;
  drops: number;
  retransmissions: number;
  completion: number | null;
}
export interface Event {
  id: string;
  time: number;
  kind: string;
  title: string;
  why: string;
  device?: string;
  link?: string;
  linkState?: { up: boolean; delay: number };
  from?: string;
  to?: string;
  end?: number;
  frame?: Frame;
  tables: Tables;
  metrics: Metrics;
  received: number[];
  status: string;
}
export interface Fault {
  time: number;
  kind: "data" | "ack" | "link" | "delay";
  link?: string;
  value?: number;
}
export interface Config {
  message: string;
  protocol: Protocol;
  sender: string;
  receiver: string;
  seed: number;
  loss: number;
  ttl: number;
  mss: number;
  timeout: number;
  retries: number;
  reorder: boolean;
  faults: Fault[];
}
export interface Result {
  events: Event[];
  packets: Packet[];
  received: string;
  metrics: Metrics;
  status: string;
  topology: Topology;
}
export const defaults: Config = {
  message: "Hello, network!",
  protocol: "TCP",
  sender: "a",
  receiver: "b",
  seed: 42,
  loss: 0,
  ttl: 16,
  mss: 8,
  timeout: 1400,
  retries: 3,
  reorder: false,
  faults: [],
};
