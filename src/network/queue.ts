/** Binary heap. Milliseconds of simulation time; insertion order breaks ties. */
export class Queue {
  private items: { time: number; order: number; run: () => void }[] = [];
  private order = 0;
  get size() {
    return this.items.length;
  }
  add(time: number, run: () => void) {
    const a = this.items,
      v = { time, order: this.order++, run };
    a.push(v);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (!this.less(v, a[p])) break;
      a[i] = a[p];
      i = p;
    }
    a[i] = v;
  }
  private less(
    a: { time: number; order: number },
    b: { time: number; order: number },
  ) {
    return a.time < b.time || (a.time === b.time && a.order < b.order);
  }
  pop() {
    const a = this.items,
      top = a[0],
      last = a.pop()!;
    if (a.length) {
      let i = 0;
      while (i * 2 + 1 < a.length) {
        let j = i * 2 + 1;
        if (j + 1 < a.length && this.less(a[j + 1], a[j])) j++;
        if (!this.less(a[j], last)) break;
        a[i] = a[j];
        i = j;
      }
      a[i] = last;
    }
    return top;
  }
}
export function random(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
