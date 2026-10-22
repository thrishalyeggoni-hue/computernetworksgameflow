import type { Event, Result } from "../network/types";
/** The simulation runs independently. Playback reveals its immutable, reproducible trace. */
export class NetworkPlayback {
  time = 0;
  playing = false;
  speed = 1;
  readAlong = false;
  private transmissions: Event[] = [];
  index = 0;
  result: Result | null = null;
  load(result: Result) {
    this.result = result;
    this.transmissions = result.events.filter(e => e.kind === "transmit" && (e.end ?? e.time) > e.time);
    this.time = 0;
    this.index = 0;
    this.playing = true;
  }
  get duration() {
    return this.result?.events.at(-1)?.time ?? 0;
  }
  get current(): Event | undefined {
    return this.result?.events[this.index];
  }
  tick(dt: number) {
    if (!this.playing || !this.result) return;
    if (!Number.isFinite(dt) || dt <= 0) return;
    if (this.readAlong) {
      // Slow the viewing clock, never the trace. Stop at transmission boundaries
      // so even a very short frame cannot be skipped between animation ticks.
      let rate = 130, boundary = this.duration;
      for (const event of this.transmissions) {
        if (event.time > this.time) boundary = Math.min(boundary, event.time);
        else if ((event.end ?? 0) > this.time) {
          rate = Math.min(rate, (event.end! - event.time) / 3);
          boundary = Math.min(boundary, event.end!);
        }
      }
      this.seek(Math.min(boundary, this.time + dt * rate));
    } else this.seek(this.time + dt * 130 * this.speed);
    if (this.time >= this.duration) this.playing = false;
  }
  seek(time: number) {
    if (!Number.isFinite(time)) return;
    this.time = Math.max(0, Math.min(time, this.duration));
    const events = this.result?.events ?? [];
    let lo = 0,
      hi = events.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (events[mid].time <= this.time) lo = mid + 1;
      else hi = mid;
    }
    this.index = Math.max(0, lo - 1);
  }
  next() {
    if (!this.result) return;
    this.playing = false;
    this.index = Math.min(this.index + 1, this.result.events.length - 1);
    this.time = this.result.events[this.index].time;
  }
  replay() {
    if (!this.result) return;
    this.index = 0;
    this.time = 0;
    this.playing = true;
  }
  reset() {
    this.result = null;
    this.transmissions = [];
    this.index = 0;
    this.time = 0;
    this.playing = false;
  }
}
