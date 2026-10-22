import { it, expect } from "vitest";
import { simulate } from "../../src/network/simulation";
import { NetworkPlayback } from "../../src/engine/network-playback";
import { Queue } from "../../src/network/queue";
it("priority queue preserves timestamp and insertion order", () => {
  const q = new Queue(),
    seen: number[] = [];
  q.add(9, () => seen.push(3));
  q.add(1, () => seen.push(1));
  q.add(1, () => seen.push(2));
  while (q.size) q.pop().run();
  expect(seen).toEqual([1, 2, 3]);
});
it("pause, speed and replay do not alter the simulation result", () => {
  const r = simulate({ faults: [{ time: 0, kind: "data" }] }),
    before = JSON.stringify(r),
    p = new NetworkPlayback();
  p.load(r);
  p.playing = false;
  p.tick(10);
  expect(p.time).toBe(0);
  p.playing = true;
  p.speed = 4;
  p.tick(1);
  expect(p.time).toBe(520);
  p.seek(p.duration);
  expect(p.current?.status).toBe("Complete");
  p.replay();
  expect(p.time).toBe(0);
  p.next();
  expect(p.playing).toBe(false);
  expect(JSON.stringify(r)).toBe(before);
  p.reset();
  expect(p.result).toBe(null);
  expect(p.current).toBeUndefined();
});
it("read-along gives every transmitted hop at least three viewing seconds without changing the trace", () => {
  const r=simulate({message:"Hi",faults:[]}),p=new NetworkPlayback();
  const before=JSON.stringify(r);p.readAlong=true;p.load(r);
  const flights=r.events.filter(e=>e.kind==='transmit'&&(e.end??0)>e.time);
  const seconds=new Map<string,number>();let iterations=0;
  while(p.playing&&iterations++<20000){
    for(const e of flights)if(e.time<=p.time&&(e.end??0)>p.time)seconds.set(e.id,(seconds.get(e.id)??0)+.05);
    p.tick(.05);
  }
  expect(p.playing).toBe(false);
  for(const e of flights)expect(seconds.get(e.id)??0).toBeGreaterThanOrEqual(2.95);
  expect(p.current?.status).toBe('Complete');expect(JSON.stringify(r)).toBe(before);
});
it("very slow numeric playback and pause keep the simulated timeline consistent",()=>{
 const p=new NetworkPlayback();p.load(simulate());p.speed=.02;p.tick(1);expect(p.time).toBeCloseTo(2.6);
 p.playing=false;p.tick(10);expect(p.time).toBeCloseTo(2.6);
 p.next();expect(p.playing).toBe(false);p.replay();expect(p.time).toBe(0);
});
