import type { Config, Event, Topology } from '../network/types';
export function livePlayByPlay(events:Event[],time:number,config:Config,topology:Topology){
 const active=events.filter(e=>e.kind==='transmit'&&e.time<=time&&(e.end??0)>time);
 // Prefer message data while it is on a cable; the notebook can inspect every event.
 const flight=active.find(e=>e.frame?.packet?.type==='DATA')??active[0];
 const event=flight??events.at(-1);
 const name=(id?:string)=>topology.devices.find(d=>d.id===id)?.name??id??'the next device';
 if(!event)return {event:undefined,title:'Ready for your first hello',explanation:'Write a message and press Send. This panel will explain the moving packet while you watch the map.',label:'LIVE PLAY-BY-PLAY',progress:0,active:0};
 const packet=event.frame?.packet;
 let explanation=event.why;
 if(flight){
  if(event.frame?.arp)explanation='Finding a local delivery label: ARP asks for an IP address’s MAC label, or carries the answer back.';
  else if(packet?.type==='SYN')explanation='TCP is asking “ready to talk?” before sending your message.';
  else if(packet?.type==='SYN-ACK')explanation='The other computer is replying “ready” so the TCP connection can begin.';
  else if(packet?.type==='ACK')explanation='A receipt is travelling back. It tells the sender which byte is expected next.';
  else if(packet?.type==='DATA')explanation=`${packet.payload.length} byte${packet.payload.length===1?'':'s'} of your message ${packet.payload.length===1?'is':'are'} crossing this cable. ${packet.protocol==='TCP'?'TCP tracks delivery and can retry missing data.':'UDP does not automatically retry a missing piece.'}`;
 }else if(event.kind==='queue')explanation='This cable is busy. The frame is waiting its turn to travel.';
 else if(event.kind==='complete')explanation='The complete message has arrived. You can replay the trip or try another experiment.';
 else if(event.kind==='drop')explanation=`A frame was lost. ${config.protocol==='TCP'?'TCP may retry after waiting for a receipt.':'UDP does not automatically retry it.'}`;
 else if(event.kind==='timeout')explanation='The expected receipt did not arrive in time. TCP is deciding whether to send again.';
 const progress=flight?Math.max(0,Math.min(1,(time-flight.time)/(flight.end!-flight.time))):0;
 return {event,title:flight?`${name(flight.from)} → ${name(flight.to)}`:event.title,explanation,label:flight?`${event.frame?.arp?'ARP':packet?.type??'FRAME'} IN FLIGHT${active.length>1?` · ${active.length} active hops`:''}`:'LIVE PLAY-BY-PLAY',progress,active:active.length};
}
