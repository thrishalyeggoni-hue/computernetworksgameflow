import { expect, it } from 'vitest';
import { connectedSteps, connectedPayload } from '../../src/learning/osi-connected';
it('connects every sender and receiver role through a single physical crossing',()=>{
 expect(connectedSteps.slice(0,7).map(s=>s.layer)).toEqual([7,6,5,4,3,2,1]);
 expect(connectedSteps[7].side).toBe('link');
 expect(connectedSteps.slice(8).map(s=>s.layer)).toEqual([1,2,3,4,5,6,7]);
 expect(connectedSteps.map(s=>s.wraps)).toEqual([0,0,0,1,2,3,3,3,3,2,1,0,0,0,0]);
});
it('uses UTF-8 byte lengths for HTTP bodies and TCP acknowledgement numbers',()=>{
 const p=connectedPayload('Hi 🌍');
 expect(p.bodyBytes.length).toBe(7);
 expect(p.request).toContain('Content-Length: 7\r\n');
 expect(p.request.split('\r\n\r\n')[1]).toBe('Hi 🌍');
 expect(p.decoded).toBe('Hi 🌍');
 expect(new TextDecoder().decode(p.bytes)).toBe(p.request);
 expect(p.ack).toBe(1000+p.bytes.length);
 expect(connectedPayload('').request).toContain('Content-Length: 0\r\n');
});
