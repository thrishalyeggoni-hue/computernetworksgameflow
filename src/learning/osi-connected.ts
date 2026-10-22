export type ConnectedStep = { side: 'sender' | 'link' | 'receiver'; layer: number; title: string; caption: string; handoff: string; wraps: number; form: string };
export const connectedSteps: ConnectedStep[] = [
 {side:'sender',layer:7,title:'Write the request',caption:'The browser creates an HTTP request carrying your hello.',handoff:'7 Application ↓ 6 Presentation',wraps:0,form:'HTTP message'},
 {side:'sender',layer:6,title:'Agree on the representation',caption:'UTF-8 represents the request as bytes both ends can interpret.',handoff:'6 Presentation ↓ 5 Session',wraps:0,form:'UTF-8 bytes'},
 {side:'sender',layer:5,title:'Keep the exchange together',caption:'The application associates this request with its conversation.',handoff:'5 Session ↓ 4 Transport',wraps:0,form:'Application bytes'},
 {side:'sender',layer:4,title:'Add the app delivery label',caption:'TCP wraps the bytes with ports and a byte sequence number.',handoff:'4 Transport ↓ 3 Network',wraps:1,form:'TCP segment'},
 {side:'sender',layer:3,title:'Add the endpoint addresses',caption:'IP wraps the TCP segment with source and destination IP addresses.',handoff:'3 Network ↓ 2 Data Link',wraps:2,form:'IP packet'},
 {side:'sender',layer:2,title:'Add the local-hop label',caption:'Ethernet wraps the IP packet with MAC addresses and an error check.',handoff:'2 Data Link ↓ 1 Physical',wraps:3,form:'Ethernet frame'},
 {side:'sender',layer:1,title:'Turn the frame into signals',caption:'The network interface sends the frame bits as signals along the link.',handoff:'1 Physical → physical link',wraps:3,form:'Bits → signals'},
 {side:'link',layer:1,title:'Cross the physical link',caption:'Only signals cross the cable. All the higher-layer information travels inside them.',handoff:'Sender Layer 1 → Receiver Layer 1',wraps:3,form:'Signals'},
 {side:'receiver',layer:1,title:'Recover the bits',caption:'The receiving interface reads the signals and recovers the frame bits.',handoff:'1 Physical ↑ 2 Data Link',wraps:3,form:'Ethernet frame'},
 {side:'receiver',layer:2,title:'Open the local-hop wrapper',caption:'Check the Ethernet frame, then hand its IP packet to the network layer.',handoff:'2 Data Link ↑ 3 Network',wraps:2,form:'IP packet'},
 {side:'receiver',layer:3,title:'Open the IP wrapper',caption:'The destination IP matches this computer. Pass its TCP segment upward.',handoff:'3 Network ↑ 4 Transport',wraps:1,form:'TCP segment'},
 {side:'receiver',layer:4,title:'Deliver bytes to the right app',caption:'TCP orders the bytes and uses destination port 80 to find the server app.',handoff:'4 Transport ↑ 5 Session',wraps:0,form:'Ordered application bytes'},
 {side:'receiver',layer:5,title:'Match the conversation',caption:'Application logic associates the received exchange with its conversation.',handoff:'5 Session ↑ 6 Presentation',wraps:0,form:'Application bytes'},
 {side:'receiver',layer:6,title:'Read the representation',caption:'Decode the UTF-8 bytes so the application can interpret the request.',handoff:'6 Presentation ↑ 7 Application',wraps:0,form:'Decoded HTTP message'},
 {side:'receiver',layer:7,title:'Your hello arrives!',caption:'The web server reads the HTTP request body: your original message.',handoff:'7 Application → the receiving app',wraps:0,form:'Your message'},
];
export function connectedPayload(message: string) {
 const bodyBytes = new TextEncoder().encode(message);
 const request = `POST /hello HTTP/1.1\r\nHost: computer-b.local\r\nContent-Type: text/plain; charset=utf-8\r\nContent-Length: ${bodyBytes.length}\r\n\r\n${message}`;
 const bytes = new TextEncoder().encode(request);
 return { request, bytes, bodyBytes, decoded: new TextDecoder().decode(bodyBytes), ack:1000+bytes.length };
}
