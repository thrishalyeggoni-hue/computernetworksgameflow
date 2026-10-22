export type Station = { name: string; icon: string; action: string; detail: string; badge: string };
export type OsiLayer = { id: number; name: string; color: string; pale: string; title: string; task: string; unit: number; form: string; stations: Station[] };
export const osiLayers: OsiLayer[] = [
  { id:1, name:'Physical', color:'#cc8330', pale:'#fff0cc', title:'A tiny hello becomes a signal.', task:'Watch bits cross a real-world link.', unit:1, form:'Bits', stations:[
    {name:'Sender NIC',icon:'computer',badge:'BITS OUT',action:'The network card receives bits.',detail:'A network interface turns the frame’s bits into signals.'},
    {name:'Signal encoder',icon:'wave',badge:'0 → 1 → 0',action:'Bits become changes in a signal.',detail:'Copper uses electrical signals; fibre uses light. This example shows a simplified digital signal.'},
    {name:'Copper link',icon:'cable',badge:'ONE LINK',action:'The signal travels along the cable.',detail:'Physical delivery connects neighbouring devices. It does not choose an Internet route.'},
    {name:'Signal reader',icon:'wave',badge:'SIGNAL → BITS',action:'The receiver samples the signal.',detail:'The receiving interface interprets the signal as a sequence of bits.'},
    {name:'Receiver NIC',icon:'computer',badge:'BITS IN',action:'The recovered bits go up to Layer 2.',detail:'The data-link layer can now read the frame. One hop is complete.'},
  ]},
  {id:2,name:'Data Link',color:'#198d7c',pale:'#c8f1e3',title:'A frame finds its next neighbour.',task:'Follow MAC addresses across one local network.',unit:2,form:'Frame',stations:[
    {name:'Sender NIC',icon:'computer',badge:'MAC …0A',action:'Wrap the IP packet in a frame.',detail:'The frame carries a source MAC, next-hop destination MAC, and an error-checking trailer.'},
    {name:'Frame builder',icon:'parcel',badge:'MAC + DATA + FCS',action:'Add the local delivery label.',detail:'For this local example, Computer B is the next hop. For a remote host, the destination MAC would be the gateway’s.'},
    {name:'LAN switch',icon:'switch',badge:'MAC → PORT',action:'The switch chooses the output port.',detail:'A learned MAC table maps destination MAC addresses to ports. Unknown destinations are flooded within the VLAN.'},
    {name:'Error check',icon:'shield',badge:'FCS ✓',action:'Check whether the frame changed.',detail:'Ethernet FCS detects many transmission errors. A bad frame is discarded; Ethernet itself does not repair it.'},
    {name:'Receiver NIC',icon:'computer',badge:'MAC …0B',action:'Remove the frame wrapper.',detail:'The IP packet continues up to Layer 3. A new routed hop would use a new link-layer frame.'},
  ]},
  {id:3,name:'Network',color:'#3b85c4',pale:'#d7edff',title:'An IP packet crosses networks.',task:'Follow the destination IP through a router.',unit:3,form:'IP packet',stations:[
    {name:'Computer A',icon:'computer',badge:'10.0.1.2',action:'Keep the final destination on the packet.',detail:'Source IP 10.0.1.2 and destination IP 10.0.2.2 identify the endpoints in this example.'},
    {name:'Gateway R1',icon:'router',badge:'NEXT HOP',action:'Send the packet to the gateway.',detail:'The destination is on another network, so Computer A sends a frame to its default gateway.'},
    {name:'Route lookup',icon:'sign',badge:'10.0.2.0/24 → R2',action:'Look up the destination prefix.',detail:'A router uses the most specific matching route. It reduces IPv4 TTL before forwarding.'},
    {name:'Router R2',icon:'router',badge:'TTL 64 → 62',action:'Forward into the destination LAN.',detail:'In this two-router example, TTL falls twice. Link-layer addresses change on each routed hop.'},
    {name:'Computer B',icon:'computer',badge:'10.0.2.2',action:'The destination IP matches this host.',detail:'The host removes the IP header and passes the payload to the transport protocol.'},
  ]},
  {id:4,name:'Transport',color:'#9360c7',pale:'#ecdfff',title:'The right bytes. The right app.',task:'See TCP order data and acknowledge delivery.',unit:4,form:'TCP segment',stations:[
    {name:'Sender app',icon:'computer',badge:'PORT 51000',action:'Give the message to TCP.',detail:'Ports identify application endpoints. This sender uses an example temporary port, 51000.'},
    {name:'TCP sender',icon:'parcel',badge:'SEQ 1000',action:'Number the bytes in this segment.',detail:'This isolated example sends your message bytes over an established connection, starting at sequence 1000. TCP numbers bytes, not packets.'},
    {name:'In-flight data',icon:'bridge',badge:'TCP → IP',action:'The segment travels inside IP.',detail:'TCP runs at the endpoints. The bridge here represents transit, not a TCP device in the network.'},
    {name:'TCP receiver',icon:'shield',badge:'ORDER + ACK',action:'Deliver ordered bytes and send an ACK.',detail:'The acknowledgement names the next expected byte. Lost data can be retransmitted; this animation shows successful delivery.'},
    {name:'Server app',icon:'computer',badge:'PORT 80',action:'The destination port selects the app.',detail:'Port 80 is the HTTP server in this unencrypted teaching example. UDP would not provide TCP’s ordering or acknowledgements.'},
  ]},
  {id:5,name:'Session',color:'#d47c40',pale:'#ffe2cc',title:'Keep the conversation together.',task:'Explore the session role inside two applications.',unit:1,form:'Conversation',stations:[
    {name:'App A',icon:'computer',badge:'HELLO',action:'Start a conversation.',detail:'The session role coordinates a dialogue between applications. These stations are software roles inside endpoints.'},
    {name:'Open dialogue',icon:'door',badge:'START',action:'Agree that this conversation has begun.',detail:'Applications may establish a session and remember which conversation later messages belong to.'},
    {name:'Conversation',icon:'chat',badge:'TAKE TURNS',action:'Keep related exchanges together.',detail:'Dialogue control can coordinate who speaks and associate multiple exchanges with the same session.'},
    {name:'Checkpoint',icon:'flag',badge:'SAVE PLACE',action:'Mark a place to continue from.',detail:'Some protocols support synchronization or recovery points. This is a conceptual example, not a feature of every session.'},
    {name:'App B',icon:'computer',badge:'GOODBYE',action:'Close the conversation cleanly.',detail:'Modern Internet apps often combine session functions with other application logic; there is no universal session header.'},
  ]},
  {id:6,name:'Presentation',color:'#bd5b9c',pale:'#f9ddef',title:'Different computers, same meaning.',task:'Turn a message into UTF-8 bytes and back.',unit:1,form:'Encoded data',stations:[
    {name:'Text in App A',icon:'computer',badge:'YOUR MESSAGE',action:'Begin with text a person can read.',detail:'The presentation role handles representation: how both ends interpret the same information.'},
    {name:'UTF-8 encoder',icon:'letters',badge:'TEXT → BYTES',action:'Encode the message as UTF-8.',detail:'A character can use more than one byte. Try a message with an emoji and compare the byte count.'},
    {name:'Byte parcel',icon:'parcel',badge:'HEX BYTES',action:'Carry the encoded representation.',detail:'These are actual UTF-8 bytes from your message. Encoding changes representation; it does not keep the message secret.'},
    {name:'UTF-8 decoder',icon:'letters',badge:'BYTES → TEXT',action:'Decode with the same character encoding.',detail:'The receiving app needs to interpret bytes using the expected representation.'},
    {name:'Text in App B',icon:'computer',badge:'SAME MEANING',action:'Read the original message again.',detail:'Compression and encryption are other representation-related functions. This demo performs UTF-8 encoding only.'},
  ]},
  {id:7,name:'Application',color:'#559450',pale:'#e0efc9',title:'A hello reaches a useful service.',task:'See a browser speak HTTP to a web server.',unit:5,form:'HTTP message',stations:[
    {name:'Your browser',icon:'computer',badge:'SEND HELLO',action:'Ask a web service to accept your message.',detail:'Applications use network services such as HTTP, DNS, email and file transfer.'},
    {name:'DNS lookup',icon:'book',badge:'NAME → IP',action:'First, find the server’s IP address.',detail:'In a separate preliminary exchange, DNS resolves a service name. DNS is not a required stop inside an HTTP packet.'},
    {name:'HTTP request',icon:'chat',badge:'POST /hello',action:'Build a request carrying your message.',detail:'This example puts your UTF-8 message in a plain HTTP request body. Lower layers carry it across the network.'},
    {name:'Web server',icon:'server',badge:'200 OK',action:'The server reads the request and responds.',detail:'The application decides what the message means and what response to send.'},
    {name:'Browser result',icon:'computer',badge:'HELLO RECEIVED',action:'Show the response to the person.',detail:'The response travels back through the stack. The seven OSI layers are roles; Internet protocols do not always fit into seven separate implementations.'},
  ]},
];
export function messageBytes(message: string) { return [...new TextEncoder().encode(message)]; }
export function layerData(id: number, message: string): string[] {
  const bytes = messageBytes(message), hex = bytes.map(b=>b.toString(16).padStart(2,'0').toUpperCase());
  if(id===1) return bytes.length ? [bytes[0].toString(2).padStart(8,'0'), 'First message byte · schematic signal'] : ['No payload bits', 'Type a message to create a signal'];
  if(id===2) return ['MAC …0A → MAC …0B', 'Frame [ IP packet ] FCS'];
  if(id===3) return ['10.0.1.2 → 10.0.2.2', 'IP [ TCP segment ] · TTL 64 → 62'];
  if(id===4) return ['51000 → 80 · SEQ 1000', `ACK ${1000 + bytes.length} · ${bytes.length} payload bytes`];
  if(id===5) return ['START → EXCHANGE → CLOSE', 'Conceptual session roles · no universal header'];
  if(id===6) return [hex.slice(0,12).join(' ') + (hex.length>12?' …':''), `${bytes.length} UTF-8 bytes ↔ ${message}`];
  return ['POST /hello · HTTP/1.1', `Body: ${message}`];
}
