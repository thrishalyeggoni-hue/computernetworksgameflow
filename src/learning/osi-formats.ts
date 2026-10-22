import { connectedPayload } from './osi-connected';
export type FormatField = {name:string;size:string};
export const tcpFields:FormatField[]=[
 {name:'Source port',size:'16 bits'},{name:'Destination port',size:'16 bits'},
 {name:'Sequence number',size:'32 bits'},{name:'Acknowledgement number',size:'32 bits'},
 {name:'Header length / reserved / flags',size:'16 bits total'},{name:'Window',size:'16 bits'},
 {name:'Checksum',size:'16 bits'},{name:'Urgent pointer',size:'16 bits'},
 {name:'Options + padding',size:'optional'},{name:'Application bytes',size:'variable'},
];
export const udpFields:FormatField[]=[{name:'Source port',size:'16 bits'},{name:'Destination port',size:'16 bits'},{name:'Length',size:'16 bits'},{name:'Checksum',size:'16 bits'},{name:'Application bytes',size:'variable'}];
export const ipFields:FormatField[]=[
 {name:'Version',size:'4 bits'},{name:'Header length',size:'4 bits'},{name:'Service field',size:'8 bits'},
 {name:'Total length',size:'16 bits'},{name:'Identification',size:'16 bits'},{name:'Flags + fragment offset',size:'16 bits'},
 {name:'TTL',size:'8 bits'},{name:'Protocol',size:'8 bits'},{name:'Header checksum',size:'16 bits'},
 {name:'Source IP',size:'32 bits'},{name:'Destination IP',size:'32 bits'},{name:'Options + padding',size:'optional'},{name:'TCP segment',size:'variable'},
];
export const ethernetFields:FormatField[]=[{name:'Destination MAC',size:'6 bytes'},{name:'Source MAC',size:'6 bytes'},{name:'EtherType',size:'2 bytes'},{name:'IP packet + padding',size:'46–1500 bytes'},{name:'FCS',size:'4 bytes'}];
export function formatExample(message:string){
 const p=connectedPayload(message);
 const tcpBytes=20+p.bytes.length,ipBytes=20+tcpBytes,frameBytes=14+Math.max(46,ipBytes)+4;
 return {...p,tcpBytes,ipBytes,frameBytes,frameBits:frameBytes*8,
  hex:[...p.bodyBytes].map(b=>b.toString(16).padStart(2,'0').toUpperCase()),
  bits:[...p.bodyBytes].map(b=>b.toString(2).padStart(8,'0'))};
}
