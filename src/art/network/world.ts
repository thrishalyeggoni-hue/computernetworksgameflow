import type { Event, Topology } from "../../network/types";
import { owner } from "../../network/topology";
export type Point = { x: number; y: number };
export interface WorldState {
  topology: Topology;
  events: Event[];
  time: number;
  selected?: string;
  reduced: boolean;
  running: boolean;
}
const ink = "#263a36",
  cream = "#fffdf4",
  mint = "#b9e6c7";
export const positions = new Map<string, Point>();
function rr(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r = 8,
  fill = cream,
  stroke = ink,
) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  c.fillStyle = fill;
  c.fill();
  c.strokeStyle = stroke;
  c.lineWidth = 2;
  c.stroke();
}
function poly(
  c: CanvasRenderingContext2D,
  pts: number[][],
  fill: string,
  stroke = ink,
) {
  c.beginPath();
  pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.closePath();
  c.fillStyle = fill;
  c.fill();
  c.strokeStyle = stroke;
  c.lineWidth = 2;
  c.lineJoin = "round";
  c.stroke();
}
function text(
  c: CanvasRenderingContext2D,
  s: string,
  x: number,
  y: number,
  size = 12,
  color = ink,
  weight = 700,
) {
  c.fillStyle = color;
  c.font = `${weight} ${size}px Quicksand, system-ui, sans-serif`;
  c.textAlign = "center";
  c.fillText(s, x, y);
}
function line(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  x2: number,
  y2: number,
  color = ink,
  w = 2,
) {
  c.beginPath();
  c.moveTo(x, y);
  c.lineTo(x2, y2);
  c.strokeStyle = color;
  c.lineWidth = w;
  c.lineCap = "round";
  c.stroke();
}
function shadow(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx = 55,
  ry = 19,
) {
  c.save();
  c.translate(x, y);
  c.scale(1, ry / rx);
  const g = c.createRadialGradient(0, 0, 1, 0, 0, rx);
  g.addColorStop(0, "#344c3638");
  g.addColorStop(1, "#344c3600");
  c.fillStyle = g;
  c.beginPath();
  c.arc(0, 0, rx, 0, Math.PI * 2);
  c.fill();
  c.restore();
}
export function port(t: Topology, id: string): Point {
  const d = owner(t, id);
  return {
    x:
      d.x +
      (d.interfaces.findIndex((i) => i.id === id) -
        (d.interfaces.length - 1) / 2) *
        16,
    y: d.y - 4,
  };
}
function point(a: Point, b: Point, p: number) {
  return {
    x: a.x + (b.x - a.x) * p,
    y: a.y + (b.y - a.y) * p - 18 * Math.sin(Math.PI * p),
  };
}
export class NetworkWorld {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cache: HTMLCanvasElement;
  private hit: { id: string; p: Point; event?: Event }[] = [];
  private observer: ResizeObserver;
  private width = 1100;
  private height = 540;
  private scale = 1;
  private ox = 0;
  private oy = 0;
  constructor(
    canvas: HTMLCanvasElement,
    private select: (id: string, event?: Event) => void,
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.cache = document.createElement("canvas");
    this.cache.width = 1100;
    this.cache.height = 540;
    this.background(this.cache.getContext("2d")!);
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(canvas);
    canvas.addEventListener("click", this.click);
    this.resize();
  }
  private click = (ev: MouseEvent) => {
    const r = this.canvas.getBoundingClientRect();
    const x = (ev.clientX - r.left - this.ox) / this.scale,
      y = (ev.clientY - r.top - this.oy) / this.scale;
    const item = [...this.hit]
      .reverse()
      .find((v) => Math.hypot(v.p.x - x, v.p.y - y) < (v.event ? 30 : 52));
    if (item) this.select(item.id, item.event);
  };
  private resize() {
    const r = this.canvas.getBoundingClientRect(),
      dpr = Math.min(3, devicePixelRatio || 1);
    this.width = r.width;
    this.height = r.height;
    this.canvas.width = Math.round(r.width * dpr);
    this.canvas.height = Math.round(r.height * dpr);
    this.scale = Math.min(r.width / 1100, r.height / 540);
    this.ox = (r.width - 1100 * this.scale) / 2;
    this.oy = (r.height - 540 * this.scale) / 2;
  }
  private background(c: CanvasRenderingContext2D) {
    c.clearRect(0, 0, 1100, 540);
    shadow(c, 550, 390, 510, 120);
    poly(
      c,
      [
        [42, 286],
        [548, 20],
        [1065, 286],
        [560, 510],
      ],
      "#c9ecdf",
    );
    poly(
      c,
      [
        [42, 286],
        [560, 510],
        [560, 529],
        [42, 305],
      ],
      "#a6cfbc",
    );
    poly(
      c,
      [
        [560, 510],
        [1065, 286],
        [1065, 305],
        [560, 529],
      ],
      "#82bba9",
    );
    c.save();
    c.beginPath();
    c.moveTo(42, 286);
    c.lineTo(548, 20);
    c.lineTo(1065, 286);
    c.lineTo(560, 510);
    c.closePath();
    c.clip();
    for (let x = -1000; x < 1500; x += 68) {
      line(c, x, 0, x + 1020, 540, "#80b8b655", 1);
      line(c, x, 540, x + 1020, 0, "#80b8b655", 1);
    }
    c.restore();
    poly(
      c,
      [
        [83, 288],
        [548, 43],
        [1022, 287],
        [560, 487],
      ],
      "#dfe8d700",
      "#a6b99b",
    );
    // Garden details, inspired by the reference’s tactile procedural scenery.
    this.plant(c, 360, 130, 1);
    this.plant(c, 775, 434, 0.8);
    this.plant(c, 100, 290, 0.6);
    text(c, "LOCAL NETWORK 01", 240, 380, 13, "#658262");
    text(c, "LOCAL NETWORK 02", 864, 395, 13, "#658262");
    c.save();
    c.translate(548, 425);
    c.rotate(-0.025);
    rr(c, -75, -17, 150, 31, 5, "#f5edc9", "#9b9779");
    text(c, "THE LITTLE INTERNET", 0, 3, 10, "#79714c");
    c.restore();
  }
  private plant(c: CanvasRenderingContext2D, x: number, y: number, s: number) {
    c.save();
    c.translate(x, y);
    c.scale(s, s);
    shadow(c, 0, 0, 28, 9);
    poly(
      c,
      [
        [-14, -24],
        [14, -24],
        [10, 0],
        [-10, 0],
      ],
      "#d4a987",
    );
    c.fillStyle = "#759761";
    for (const [xx, yy, rx, ry, rot] of [
      [-8, -40, 9, 19, -0.6],
      [9, -43, 9, 21, 0.7],
      [0, -49, 8, 24, 0],
    ]) {
      c.beginPath();
      c.ellipse(xx, yy, rx, ry, rot, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = ink;
      c.lineWidth = 1.5;
      c.stroke();
    }
    c.restore();
  }
  draw(s: WorldState, t: number) {
    const c = this.ctx,
      dpr = Math.min(3, devicePixelRatio || 1);
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, this.width, this.height);
    c.translate(this.ox, this.oy);
    c.scale(this.scale, this.scale);
    c.drawImage(this.cache, 0, 0);
    this.hit = [];
    const disabled = new Set(
      s.topology.links.filter((l) => !l.up).map((l) => l.id),
    );
    const delays = new Map(s.topology.links.map((l) => [l.id, l.delay]));
    for (const e of s.events) {
      if (e.time > s.time) break;
      if (e.link && e.linkState) {
        e.linkState.up ? disabled.delete(e.link) : disabled.add(e.link);
        delays.set(e.link, e.linkState.delay);
      }
    }
    const active = s.events.filter(
      (e) => e.kind === "transmit" && e.time <= s.time && (e.end ?? 0) > s.time,
    );
    for (const l of s.topology.links) {
      const a = port(s.topology, l.a),
        b = port(s.topology, l.b),
        off = disabled.has(l.id),
        on = active.some((e) => e.link === l.id);
      c.setLineDash(off ? [8, 6] : []);
      line(c, a.x, a.y + 4, b.x, b.y + 4, "#35483a30", 8);
      line(
        c,
        a.x,
        a.y,
        b.x,
        b.y,
        off ? "#ba7770" : on ? "#4a8bcd" : "#77967f",
        5,
      );
      line(
        c,
        a.x,
        a.y - 1,
        b.x,
        b.y - 1,
        off ? "#d99588" : on ? "#acd4fc" : "#bdd2b5",
        2,
      );
      c.setLineDash([]);
      const mid = point(a, b, 0.5);
      rr(
        c,
        mid.x - 18,
        mid.y + 15,
        36,
        17,
        7,
        off ? "#fbd9cf" : "#e8eddf",
        off ? "#ba7770" : "#9bb393",
      );
      text(
        c,
        off ? "OFF" : `${delays.get(l.id)}ms`,
        mid.x,
        mid.y + 27,
        9,
        off ? "#96443a" : "#61775a",
      );
      // Small direction chevrons follow the actual cable.
      if (on && !off) {
        const e = active.find((e) => e.link === l.id)!;
        const forward = owner(s.topology, l.a).id === e.from;
        const p = point(forward ? a : b, forward ? b : a, 0.68);
        const angle = Math.atan2(
          (forward ? b : a).y - (forward ? a : b).y,
          (forward ? b : a).x - (forward ? a : b).x,
        );
        c.save();
        c.translate(p.x, p.y);
        c.rotate(angle);
        poly(
          c,
          [
            [-5, -4],
            [3, 0],
            [-5, 4],
          ],
          "#315e8a",
          "#315e8a",
        );
        c.restore();
      }
    }
    for (const d of [...s.topology.devices].sort((a, b) => a.y - b.y)) {
      const selected = s.selected === d.id;
      const state = active.find((e) => e.from === d.id || e.to === d.id);
      const recent = s.events
        .filter((e) => e.time <= s.time && e.device === d.id)
        .at(-1);
      const connected = d.interfaces.some((i) =>
        s.topology.links.some(
          (l) => (l.a === i.id || l.b === i.id) && !disabled.has(l.id),
        ),
      );
      const status = !connected
        ? "Disconnected"
        : state
          ? state.from === d.id
            ? "Sending"
            : "Receiving"
          : recent?.kind === "queue"
            ? "Queued"
            : recent &&
                ["drop", "no-route"].includes(recent.kind) &&
                s.time - recent.time < 130
              ? "Failed"
              : "Idle";
      this.device(
        c,
        d.x,
        d.y,
        d.kind,
        d.name,
        selected,
        !!state,
        t,
        s.reduced,
        status,
      );
      for (const i of d.interfaces) {
        const p = port(s.topology, i.id);
        rr(c, p.x - 4, p.y - 3, 8, 6, 1, "#354b41");
      }
      this.hit.push({ id: d.id, p: { x: d.x, y: d.y - 32 } });
    }
    for (const e of active) {
      const l = s.topology.links.find((l) => l.id === e.link);
      if (!l) continue;
      let a = port(s.topology, l.a),
        b = port(s.topology, l.b);
      if (owner(s.topology, l.a).id !== e.from) [a, b] = [b, a];
      const fraction = s.reduced
        ? 0.5
        : Math.min(1, (s.time - e.time) / ((e.end ?? e.time + 1) - e.time));
      const p = point(a, b, fraction);
      const packet = e.frame?.packet,
        color = e.frame?.arp
          ? "#f4dca0"
          : packet?.type === "ACK" || packet?.type === "SYN-ACK"
            ? "#9bdec3"
            : packet?.attempt
              ? "#f1ca7c"
              : packet?.protocol === "UDP"
                ? "#b9a7e9"
                : "#91bfe9";
      shadow(c, p.x, p.y + 12, 23, 9);
      const bob = s.reduced ? 0 : Math.sin(t * 5) * 2;
      c.save();
      c.translate(p.x, p.y - 10 + bob);
      poly(
        c,
        [
          [-14, -8],
          [0, -15],
          [15, -7],
          [0, 1],
        ],
        color,
      );
      poly(
        c,
        [
          [-14, -8],
          [0, 1],
          [0, 17],
          [-14, 8],
        ],
        color,
      );
      poly(
        c,
        [
          [0, 1],
          [15, -7],
          [15, 9],
          [0, 17],
        ],
        color,
      );
      line(c, -6, -12, 8, -4, "#ffffffaa", 3);
      text(
        c,
        packet?.type === "DATA"
          ? `${packet.index + 1}`
          : e.frame?.arp
            ? "?"
            : "✓",
        1,
        10,
        10,
      );
      c.restore();
      this.hit.push({ id: packet?.id ?? e.frame!.id, p, event: e });
    }

    // Bounded effects derive only from recorded events, never from protocol state mutations.
    const losses = s.events
      .filter(
        (e) => e.kind === "drop" && e.time <= s.time && s.time - e.time < 100,
      )
      .slice(-8);
    for (const e of losses) {
      const d = s.topology.devices.find((d) => d.id === e.device);
      if (!d) continue;
      text(c, "× LOST", d.x + 28, d.y - 85, 13, "#b36f59");
    }
    const success = s.events.find(
      (e) => e.kind === "complete" && e.time <= s.time && s.time - e.time < 180,
    );
    if (success && !s.reduced) {
      const receiver = s.topology.devices.find((d) =>
        d.interfaces.some(
          (i) =>
            i.ip ===
            s.events.find((e) => e.frame?.packet?.type === "DATA")?.frame
              ?.packet?.dst,
        ),
      );
      if (receiver) {
        const phase = (s.time - success.time) / 180;
        for (let i = 0; i < 16; i++) {
          const angle = i * 2.4;
          const r = 20 + phase * 70;
          text(
            c,
            "✦",
            receiver.x + Math.cos(angle) * r,
            receiver.y - 65 + Math.sin(angle) * r,
            8,
            ["#a4bf89", "#e3bf6e", "#8abbb0"][i % 3],
          );
        }
      }
    }
    // Original tiny mailbot guide.
    const x = 365,
      y = 423,
      bob = s.reduced ? 0 : Math.sin(t * 2) * 1.5;
    shadow(c, x, y + 8, 27, 9);
    c.save();
    c.translate(x, y + bob);
    rr(c, -17, -31, 34, 29, 10, "#f1d8a0");
    rr(c, -12, -25, 24, 13, 4, "#35594d");
    text(c, "• •", 0, -15, 14, "#d6f4cf");
    line(c, 0, -31, 0, -40);
    rr(c, -3, -44, 6, 6, 3, mint);
    line(c, -12, 0, -12, 6, ink, 5);
    line(c, 12, 0, 12, 6, ink, 5);
    c.restore();
  }
  private device(
    c: CanvasRenderingContext2D,
    x: number,
    y: number,
    kind: string,
    name: string,
    selected: boolean,
    active: boolean,
    t: number,
    reduced: boolean,
    status: string,
  ) {
    shadow(c, x, y + 8);
    if (selected) {
      c.save();
      c.setLineDash([5, 4]);
      c.beginPath();
      c.ellipse(x, y + 4, 61, 28, 0, 0, Math.PI * 2);
      c.strokeStyle = "#397c57";
      c.lineWidth = 2;
      c.stroke();
      c.restore();
    }
    poly(
      c,
      [
        [x - 48, y - 1],
        [x, y - 24],
        [x + 48, y - 1],
        [x, y + 23],
      ],
      "#edf0d9",
      "#92aa88",
    );
    poly(
      c,
      [
        [x - 48, y - 1],
        [x, y + 23],
        [x, y + 30],
        [x - 48, y + 6],
      ],
      "#c3d3b6",
      "#92aa88",
    );
    poly(
      c,
      [
        [x, y + 23],
        [x + 48, y - 1],
        [x + 48, y + 6],
        [x, y + 30],
      ],
      "#acbea1",
      "#92aa88",
    );
    if (kind === "host") {
      poly(
        c,
        [
          [x - 31, y - 12],
          [x + 13, y + 4],
          [x + 37, y - 8],
          [x - 9, y - 24],
        ],
        "#e9ddc5",
      );
      line(c, x, y - 14, x, y - 28, ink, 8);
      poly(
        c,
        [
          [x - 35, y - 73],
          [x + 27, y - 73],
          [x + 36, y - 64],
          [x + 36, y - 20],
          [x + 27, y - 25],
          [x - 35, y - 25],
        ],
        "#b3c0b4",
      );
      rr(c, x - 40, y - 77, 68, 51, 7, "#f8eed4");
      rr(
        c,
        x - 34,
        y - 71,
        56,
        38,
        3,
        name.endsWith("A") ? "#b0d9f4" : "#d3c4f4",
      );
      c.textAlign = "left";
      c.fillStyle = "#38584d";
      c.font = "700 8px monospace";
      c.fillText(name.endsWith("A") ? "> hello_" : "> ready_", x - 28, y - 54);
      line(c, x - 28, y - 46, x - 7, y - 46, "#709f8f", 2);
      line(c, x - 28, y - 40, x + 10, y - 40, "#709f8f", 2);
      rr(c, x + 15, y - 31, 5, 3, 1, active ? "#4da57e" : "#b4b99b");
    } else if (kind === "router") {
      poly(
        c,
        [
          [x - 34, y - 38],
          [x + 6, y - 53],
          [x + 40, y - 36],
          [x, y - 20],
        ],
        "#bde9d4",
      );
      poly(
        c,
        [
          [x - 34, y - 38],
          [x, y - 20],
          [x, y - 4],
          [x - 34, y - 20],
        ],
        "#8dd0b5",
      );
      poly(
        c,
        [
          [x, y - 20],
          [x + 40, y - 36],
          [x + 40, y - 20],
          [x, y - 4],
        ],
        "#69b69a",
      );
      line(c, x - 17, y - 42, x - 17, y - 67, ink, 4);
      line(c, x + 22, y - 43, x + 22, y - 67, ink, 4);
      text(c, "↔", x + 1, y - 32, 25, "#42624d");
      for (let j = 0; j < 3; j++)
        rr(
          c,
          x + 8 + j * 9,
          y - 19 - j * 4,
          4,
          4,
          1,
          active ? "#d6f3b5" : "#b3d3b8",
        );
    } else {
      poly(
        c,
        [
          [x - 38, y - 29],
          [x + 7, y - 45],
          [x + 39, y - 30],
          [x - 6, y - 13],
        ],
        "#ffe3a0",
      );
      poly(
        c,
        [
          [x - 38, y - 29],
          [x - 6, y - 13],
          [x - 6, y - 2],
          [x - 38, y - 18],
        ],
        "#e2bc73",
      );
      poly(
        c,
        [
          [x - 6, y - 13],
          [x + 39, y - 30],
          [x + 39, y - 18],
          [x - 6, y - 2],
        ],
        "#cfab62",
      );
      for (let j = 0; j < 5; j++)
        rr(
          c,
          x + 1 + j * 7,
          y - 13 - j * 2.6,
          4,
          5,
          1,
          active ? "#e4f6bc" : "#5b6f52",
        );
      text(c, "····", x, y - 27, 15, "#9d9569");
    }
    if (active && !reduced) {
      const r = 3 + Math.sin(t * 5);
      c.beginPath();
      c.arc(x + 39, y - 54, r, 0, Math.PI * 2);
      c.fillStyle = "#579f69";
      c.fill();
    }
    rr(
      c,
      x - 49,
      y + 36,
      98,
      23,
      7,
      selected ? "#d8eac9" : "#fffcf0",
      "#a6b59b",
    );
    text(c, name, x, y + 52, 12);
    text(
      c,
      status.toUpperCase(),
      x,
      y + 72,
      8,
      status === "Failed" || status === "Disconnected"
        ? "#a25e50"
        : status === "Idle"
          ? "#7f9674"
          : "#456f4d",
      600,
    );
  }
  destroy() {
    this.observer.disconnect();
    this.canvas.removeEventListener("click", this.click);
  }
}
