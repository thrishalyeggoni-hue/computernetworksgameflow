# Computer Networks, in everyday language

VNRVJIET · R25 · CSE (Cyber Security) · II year / III semester

25PC1CY201 — Computer Networks (theory, 3 credits). [Official syllabus, printed pages 8–9](https://www.vnrvjiet.ac.in/__l5e/assets-v1/d9ef8b4d-3050-4e88-b889-d240c02d2b53/II-B.Tech-CYS-R25.pdf#page=8).

Independent teaching notes, not official college notes. Laboratory experiments are excluded. Each topic explicitly distinguishes the app’s live/partial model from theory-only coverage.

## Unit 1: How a network carries a message

**What needs to exist before two computers can talk?**

Imagine sending a parcel: you need a sender, a receiver, something to send, a route to carry it, and shared rules. A computer network needs the same basic ingredients, but carries information as signals and bits.

### Communication components

Coverage: **Live model**

**Everyday explanation:** A conversation needs someone sending, someone receiving, a message, a medium, and agreed rules.

**Networking terms:** A communication system includes sender, receiver, message, transmission medium, and protocol. Each has a separate role.

**In PacketVerse:** Computer A is the sender, Computer B is the receiver, your text supplies the message, links carry frames, and protocols define behavior.

**Common mix-up:** The cable is not the protocol. One is a means of carrying signals; the other specifies rules.

### Representing information & data flow

Coverage: **Partial model**

**Everyday explanation:** Computers turn text, pictures, sound, and other information into bits before transmission. A conversation may be one-way or two-way.

**Networking terms:** Encoding defines a representation. Simplex is one-way; half-duplex allows both directions at different times; full-duplex allows both directions concurrently.

**In PacketVerse:** Your text is encoded as UTF-8 bytes. Links use independent directional queues, illustrating a simplified full-duplex connection.

**Common mix-up:** One visible character is not always one byte. ACKs flowing backward are control traffic, not another copy of the application message.

### Networks and topologies

Coverage: **Partial model**

**Everyday explanation:** Topology is the connection plan: who has a direct connection to whom.

**Networking terms:** Common arrangements include star, bus, ring, mesh, and hybrid topologies. Physical layout and logical communication behavior are related but need not be identical.

**In PacketVerse:** The drawing is a fixed wired topology with a primary and an alternative routed path. Trace actual cables rather than treating the isometric floor grid as a network.

**Common mix-up:** A visually short cable is not necessarily the lowest-cost route; configured delay and bandwidth matter. Other topology types are explained rather than drawn dynamically.

### Protocols and standards

Coverage: **Partial model**

**Everyday explanation:** People communicate more easily when they agree on formats and procedures. Devices need compatible rules too.

**Networking terms:** Protocols specify message formats and behavior, including timing where relevant. Standards promote interoperability between independently built implementations.

**In PacketVerse:** The notebook distinguishes Ethernet, IPv4, TCP, and UDP fields instead of labeling every parcel with one generic address.

**Common mix-up:** A teaching subset of a protocol is not full standards compliance. PacketVerse explicitly documents its omissions.

### The seven OSI layers

Coverage: **Partial model**

**Everyday explanation:** A big delivery job is easier to understand when split into responsibilities.

**Networking terms:** From top to bottom: application provides communication services; presentation concerns representation; session concerns dialogue organization; transport serves communicating processes; network handles internetwork delivery; data link handles local frames; physical concerns signals and media.

**In PacketVerse:** Open Encapsulation to see where application bytes, transport fields, IPv4 fields, and Ethernet fields fit.

**Common mix-up:** OSI is an explanatory reference model, not a requirement to add seven independent headers. A TCP handshake belongs to transport.

### Transmission media

Coverage: **Theory only**

**Everyday explanation:** A message can travel through copper, light in fiber, or radio through space. Each medium has different practical limits.

**Networking terms:** Guided media include twisted pair, coaxial cable, and optical fiber. Unguided media use electromagnetic propagation without a cable guiding the path.

**In PacketVerse:** The links expose bandwidth and propagation delay, but do not simulate electrical signals, light wavelengths, radio interference, or attenuation.

**Common mix-up:** Bandwidth, latency, and actual achieved data rate are different quantities. A wider pipe does not remove propagation time.

### Wired LAN, wireless LAN & connecting LANs

Coverage: **Partial model**

**Everyday explanation:** A LAN connects nearby devices. Larger communication systems join several local networks.

**Networking terms:** Ethernet and wireless LANs provide local connectivity with different access mechanisms. Bridges/switches connect compatible layer-2 segments; routers connect IP networks.

**In PacketVerse:** Switch A and Switch B serve two local Ethernet segments; routers carry traffic between their IP subnets.

**Common mix-up:** This app models wired Ethernet. A cable icon is not a wireless channel, and ARP broadcasts are not forwarded through routers.

### Virtual LANs

Coverage: **Theory only**

**Everyday explanation:** One physical building can contain separate groups with separate local conversations.

**Networking terms:** A VLAN separates layer-2 broadcast domains on supported infrastructure. Communication across VLANs generally requires layer-3 forwarding; tags may identify VLANs on appropriate links.

**In PacketVerse:** Compare the two separate local networks as a starting picture, then imagine a VLAN-capable switch maintaining several logical local networks.

**Common mix-up:** Separate subnets in this scene do not demonstrate actual VLAN tagging or trunk behavior. VLANs are not implemented here.

### Multiplexing: FDM, TDM & WDM

Coverage: **Theory only**

**Everyday explanation:** Several users can share a resource by receiving separate bands, separate time turns, or separate light wavelengths.

**Networking terms:** Frequency division separates frequency bands; time division separates time slots; wavelength division carries different optical wavelengths over fiber.

**In PacketVerse:** Think of three different ways to organize a shared link. The current FIFO queue is not an FDM, TDM, or WDM implementation.

**Common mix-up:** Multiplexing is sharing a transmission resource; routing is choosing a path. These are different jobs.

### Spread spectrum

Coverage: **Theory only**

**Everyday explanation:** Instead of concentrating a signal in a narrow portion of spectrum, a system spreads it according to an agreed method.

**Networking terms:** Frequency hopping changes carrier frequencies over time; direct-sequence techniques spread a signal using a faster code sequence. Receivers need corresponding coordination.

**In PacketVerse:** Use this as a theory topic about radio communication; no spread-spectrum waveform is generated in the scene.

**Common mix-up:** Spreading is not the same as encryption and does not, by itself, make message contents secret.

### Worked example: One small link calculation

1. Suppose one Ethernet frame is 64 bytes. That is 64 × 8 = 512 bits.
2. At 64,000 bit/s, serialization takes 512 ÷ 64,000 seconds = 8 ms.
3. With 12 ms propagation and no queue wait, that frame arrives 20 ms after transmission starts.
4. This is one link, not the whole message journey. Protocol setup, other hops, waiting, and replies can add time.

### Revision prompts

- Identify communication components and compare simplex, half-duplex, and full-duplex.
- Draw common topologies and explain protocols versus standards.
- Name OSI layers and explain a responsibility for each.
- Compare media, wired/wireless LANs, VLANs, multiplexing, and spread spectrum.

### Check your understanding

If you double a link’s bandwidth, do you halve its propagation delay?

No. Higher bandwidth can reduce serialization time for a fixed-size frame. Propagation depends on the medium and distance; it is a separate delay.

### Explore here

Send a short message. Open Encapsulation, then inspect a transmit event to compare bytes, bit/s, and milliseconds.


## Unit 2: Getting frames across a local link

**How do neighbors share a channel and notice mistakes?**

Think of passing numbered pages to the next desk. The receiver needs to notice damaged or missing pages, the sender must not overwhelm the desk, and everyone using a shared channel needs rules for taking turns.

### Data link and MAC responsibilities

Coverage: **Partial model**

**Everyday explanation:** One part of networking concerns the next local crossing, rather than the entire trip across many networks.

**Networking terms:** The data link layer works with frames. Its medium-access-control functions address sharing access to a medium and related local addressing behavior.

**In PacketVerse:** Inspect Ethernet source/destination MACs and the switch’s learned MAC-to-port table.

**Common mix-up:** A MAC address is not an IPv4 address, and a switch MAC table is not a router’s IP forwarding table.

### Error detection versus correction

Coverage: **Theory only**

**Everyday explanation:** Knowing a page is damaged is different from knowing what the original page should have said.

**Networking terms:** Detection signals an inconsistency; correction recovers original information within a code’s capability. Redundancy supports both, with different guarantees.

**In PacketVerse:** Loss and retransmission make reliability visible, but PacketVerse does not corrupt bits or calculate error-correcting codes.

**Common mix-up:** The app’s Drop button discards a frame. It does not flip bits or run a CRC decoder.

### Block coding

Coverage: **Theory only**

**Everyday explanation:** Add carefully chosen extra bits so valid messages have a recognizable structure.

**Networking terms:** A block code maps a k-bit data block to an n-bit codeword, with n greater than k when redundancy is added. Not every n-bit pattern is necessarily a valid codeword.

**In PacketVerse:** Use paper codewords to study coding before relating it to frames moving on a link.

**Common mix-up:** Extra bits are useful only when the coding/decoding scheme gives them a defined meaning; arbitrary padding is not error correction.

### Hamming distance

Coverage: **Theory only**

**Everyday explanation:** Count the positions where two equal-length bit strings differ. That distance helps describe how distinguishable codewords are.

**Networking terms:** A code with minimum distance d can detect up to d−1 bit errors and correct up to floor((d−1)/2) errors under the usual bounded-error model.

**In PacketVerse:** For codewords 000 and 111, the distance is 3. A received 001 is closer to 000 when assuming at most one changed bit.

**Common mix-up:** Hamming distance is a measure; a Hamming code is a specific coding family. They are not interchangeable terms.

### CRC

Coverage: **Theory only**

**Everyday explanation:** Attach a calculated check value so the receiver can test whether the received bits fit an agreed rule.

**Networking terms:** Cyclic redundancy checking uses modulo-2 polynomial division and an agreed generator. The receiver checks the resulting remainder; detection guarantees depend on the generator and error pattern.

**In PacketVerse:** Ethernet frame size includes an FCS allowance here, but its CRC value is not computed or validated.

**Common mix-up:** CRC generally detects specified classes of errors; it is not a cryptographic signature and does not automatically correct the payload.

### Flow control versus error control

Coverage: **Partial model**

**Everyday explanation:** One problem is sending too fast for the receiver. Another is dealing with loss or damage.

**Networking terms:** Flow control limits outstanding traffic according to receiver capability. Error control includes mechanisms such as sequence labels, acknowledgements, timers, and retransmission.

**In PacketVerse:** The teaching link queues can fill, while TCP ACK/timer events illustrate separate recovery ideas.

**Common mix-up:** Receiver flow control is not the same as network congestion control. This TCP subset does not implement full receiver-window flow control.

### Stop-and-Wait

Coverage: **Theory only**

**Everyday explanation:** Send one numbered page and wait for its receipt before sending the next.

**Networking terms:** A Stop-and-Wait sender allows one outstanding frame. With ARQ, a timeout can trigger retransmission; sequence numbers help the receiver distinguish a duplicate.

**In PacketVerse:** Compare this idea with the app’s event timeline, but do not treat its pipelined TCP sender as a Stop-and-Wait implementation.

**Common mix-up:** A lost ACK can cause a duplicate transmission even when the original data arrived correctly.

### Sliding windows

Coverage: **Partial model**

**Everyday explanation:** A sender can have several pages on the way before receipts return. The window limits how many remain outstanding.

**Networking terms:** Window-based protocols track a permitted range of sequence numbers. Sender and receiver rules determine buffering and recovery behavior.

**In PacketVerse:** Several parcels moving together provide a useful picture of outstanding traffic.

**Common mix-up:** The app has a simplified small-message TCP sending model, not configurable link-layer sliding-window protocols.

### Go-Back-N ARQ

Coverage: **Theory only**

**Everyday explanation:** If an early page is missing, a basic receiver may discard later pages; the sender goes back and sends the missing page and subsequent outstanding pages again.

**Networking terms:** Go-Back-N normally uses cumulative acknowledgements, a sender window, and an in-order receiver that does not buffer out-of-order frames in the basic model.

**In PacketVerse:** Use the worked comparison below to contrast it with selective recovery.

**Common mix-up:** The TCP behavior implemented here buffers out-of-order bytes. It should not be labeled as the basic Go-Back-N receiver.

### Selective Repeat ARQ

Coverage: **Theory only**

**Everyday explanation:** Keep usable pages that arrived out of order and ask for only the missing ones to be sent again.

**Networking terms:** Selective Repeat uses buffering and selective frame acknowledgement/retransmission rules. Its sequence-space and window constraints avoid confusing old and new frames.

**In PacketVerse:** Buffering is a useful shared idea, but the app’s TCP cumulative ACKs are not Selective Repeat link ARQ.

**Common mix-up:** Similar-looking animations do not make two protocols identical. Their ACK semantics and timers matter.

### Piggybacking

Coverage: **Theory only**

**Everyday explanation:** If you are sending a letter back anyway, include the receipt for the letter you just received.

**Networking terms:** A protocol can include acknowledgement information with reverse-direction data rather than always sending a separate acknowledgement frame.

**In PacketVerse:** TCP data in this app can carry an ACK flag, but the application does not model two-way message exchanges for a full piggybacking comparison.

**Common mix-up:** Piggybacking needs suitable reverse traffic; delaying an ACK indefinitely while waiting for it is not safe.

### Random access: Pure and Slotted ALOHA

Coverage: **Theory only**

**Everyday explanation:** On a shared channel, users may attempt to speak without first reserving a dedicated turn. Two attempts can overlap.

**Networking terms:** Pure ALOHA permits transmission attempts at arbitrary times. Slotted ALOHA aligns attempts to slots, requiring timing coordination and reducing the vulnerable overlap interval.

**In PacketVerse:** These shared-channel collisions are theory topics. The full-duplex point-to-point cables here do not simulate ALOHA contention.

**Common mix-up:** A random frame loss in the simulator is not evidence of a collision or an ALOHA backoff.

### CSMA/CD, CSMA/CA and code division

Coverage: **Theory only**

**Everyday explanation:** Listening before speaking can reduce interruptions, but different media need different ways to handle remaining conflicts.

**Networking terms:** CSMA/CD detects collisions in shared half-duplex Ethernet. CSMA/CA uses avoidance mechanisms in wireless LANs. CDMA separates users by coding. The syllabus prints “CDMA/CA”; these notes distinguish CSMA/CA from CDMA rather than treating them as the same protocol.

**In PacketVerse:** The local links are modeled as full-duplex, so collision detection/avoidance and code-division access are explained separately.

**Common mix-up:** Modern switched full-duplex Ethernet does not use collision detection on those links. Check the printed notation with your instructor when revising the syllabus wording.

### Worked example: Four pages, with page 1 missing

1. Imagine sending pages numbered 0, 1, 2, 3. Page 1 is lost.
2. Stop-and-Wait would not normally send pages 2 and 3 while waiting for page 1’s receipt.
3. In basic Go-Back-N, later out-of-order frames are discarded, and recovery retransmits page 1 plus subsequent outstanding frames.
4. In Selective Repeat, pages 2 and 3 can be buffered and only the missing frame needs retransmission.
5. These are conceptual link-layer comparisons. PacketVerse’s TCP byte-stream recovery is a separate transport-layer model.

### Revision prompts

- Compare detection/correction; explain block coding, distance, and CRC.
- Differentiate receiver flow control from error control.
- Trace Stop-and-Wait, Go-Back-N, Selective Repeat, windows, and piggybacking.
- Compare ALOHA variants and distinguish CSMA/CD, CSMA/CA, and CDMA.

### Check your understanding

Does a dropped ACK prove that the data did not reach the receiver?

No. The receiver may have received the data and sent an ACK that was later lost. Sequence numbers and duplicate handling are needed so recovery does not deliver the same data twice.

### Explore here

Observe data loss and ACK-driven recovery, then compare the general reliability ideas with Unit II’s link ARQ schemes. This demonstration is TCP, not an implementation of those link protocols.


## Unit 3: Addresses, next hops & routes

**How does a packet find a computer on another network?**

A delivery address identifies the destination, but each junction still needs to choose its next turn. IP addresses name destinations in an internetwork; routers use forwarding information to choose local next hops.

### Network layer and switching techniques

Coverage: **Partial model**

**Everyday explanation:** A network may reserve a path for a conversation or move separately addressed pieces through shared infrastructure.

**Networking terms:** Circuit switching reserves resources along a connection; packet switching shares links between packets. Message switching stores/forwards whole messages rather than packet-sized pieces.

**In PacketVerse:** Packets in this app move hop by hop through queues and routers, providing a simplified packet-switched journey.

**Common mix-up:** An Ethernet switch is a device; circuit/packet/message switching describes broader communication techniques. The same word has different contexts.

### IPv4 addresses and subnets

Coverage: **Live model**

**Everyday explanation:** An address tells you which destination is intended; a subnet prefix identifies the local neighborhood relevant to forwarding.

**Networking terms:** IPv4 uses 32-bit addresses. Prefix lengths identify matching network bits. Longest-prefix matching selects the most specific applicable forwarding entry.

**In PacketVerse:** Inspect 192.168.1.10 and 192.168.2.20, their interface prefixes, and the routing-table entries.

**Common mix-up:** An IP address alone is not enough to determine whether two hosts are local to each other; their configured prefixes matter.

### IPv6

Coverage: **Theory only**

**Everyday explanation:** A larger addressing system also changes protocol details; it is not just IPv4 written with longer numbers.

**Networking terms:** IPv6 uses 128-bit addresses and hexadecimal notation. It has different header and neighbor-discovery mechanisms; it does not use IPv4 ARP.

**In PacketVerse:** Compare IPv6 conceptually with the IPv4 addresses in the inspector. All packet forwarding in this simulator is IPv4.

**Common mix-up:** Do not expect the app’s ARP exchange or IPv4 TTL field to be a complete IPv6 demonstration.

### ARP: local IP to local MAC

Coverage: **Live model**

**Everyday explanation:** Before passing a frame to the next neighbor, a device asks which local hardware address corresponds to the chosen next-hop IP.

**Networking terms:** ARP exchanges requests and replies on the local Ethernet segment and caches the result. For a remote destination, a host resolves its gateway’s MAC rather than the remote host’s MAC.

**In PacketVerse:** Watch ARP request/reply frames and inspect the ARP Cache after sending.

**Common mix-up:** ARP is local address resolution. It does not discover a complete internet route or allocate the host’s IP address.

### RARP, BOOTP and DHCP

Coverage: **Theory only**

**Everyday explanation:** A newly starting device may need help learning its own configuration, which is a different question from finding a neighbor’s MAC.

**Networking terms:** RARP historically sought an IP address using a hardware identity. BOOTP supplied bootstrap configuration. DHCP adds mechanisms such as leases and configuration exchange.

**In PacketVerse:** The lab starts with predefined addresses, so none of these boot/configuration protocols runs when you click Send.

**Common mix-up:** ARP asks about an address needed for a local frame. DHCP supplies configuration; it is not simply ARP in reverse.

### Delivery, forwarding and routing

Coverage: **Partial model**

**Everyday explanation:** Delivery is the overall job, forwarding is one local action, and routing determines information that makes those local actions possible.

**Networking terms:** A router applies a forwarding table to a packet. Route computation/control builds or updates that information. Unicast targets one destination rather than a broadcast group.

**In PacketVerse:** The app recomputes routes centrally with Dijkstra after selected link/delay changes, then uses longest-prefix forwarding at routers.

**Common mix-up:** Dijkstra alone is not OSPF, RIP, BGP, or another complete distributed routing protocol. Protocol exchanges and convergence are not simulated.

### What changes at each routed hop?

Coverage: **Live model**

**Everyday explanation:** The destination address on the parcel remains the same, while the local delivery wrapper can change at each stage.

**Networking terms:** In this no-NAT model, endpoint IPs remain unchanged. Routers decrement IPv4 TTL and build a new Ethernet frame with local next-hop MAC addresses.

**In PacketVerse:** Compare Packet Fields at Router 1 and Router 2. Use The scenic route or the TTL expiry scenario.

**Common mix-up:** TTL is a hop-related lifetime field here, not an animation countdown. Ethernet source/destination addresses do not normally remain the same across routers.

### Worked example: Sending to another neighborhood

1. Computer A is 192.168.1.10/24; Computer B is 192.168.2.20/24. The receiver is outside A’s local subnet.
2. A chooses its gateway, 192.168.1.1, and uses ARP to learn that gateway’s MAC.
3. The first frame is addressed to the gateway’s MAC, while the packet’s destination IP remains Computer B’s IP.
4. Routers choose next hops, decrement TTL, and replace the Ethernet wrapper. The destination IP is still Computer B’s IP.
5. At the destination LAN, the last router resolves Computer B’s MAC and forwards the frame locally.

### Revision prompts

- Compare switching techniques and distinguish devices from techniques.
- Explain IPv4 prefixes and longest-prefix matching; contrast IPv4 and IPv6.
- Distinguish ARP, RARP, BOOTP, and DHCP.
- Explain delivery/forwarding/routing and unicast; trace IP, MAC, and TTL changes.

### Check your understanding

When A sends to a remote IP, does its first Ethernet frame use the remote computer’s MAC?

Normally no. A addresses the first local frame to its gateway’s MAC. The remote computer’s IP stays in the IP packet; successive routers build the local Ethernet wrappers they need.

### Explore here

Send through the alternative routed path. Inspect routing entries, then compare IP addresses, MAC addresses, and TTL at successive events.


## Unit 4: Talking between applications reliably

**How do two applications exchange data, and what happens when traffic gets crowded?**

Getting data to the right computer is not the end: it must reach the right application. Some conversations need ordered recovery; others use independent messages. Shared network capacity also needs careful management.

### Process-to-process communication and ports

Coverage: **Live model**

**Everyday explanation:** An IP address gets you to a building; a port helps identify the receiving service or communication endpoint within that computer.

**Networking terms:** Transport protocols use ports to distinguish communicating application endpoints. Protocol plus addresses and ports helps identify a flow.

**In PacketVerse:** Inspect source port 49152 and destination port 8080 on the simulated transport packets.

**Common mix-up:** A port number is a transport identifier, not a physical Ethernet socket, and it does not automatically authenticate an application.

### UDP

Coverage: **Partial model**

**Everyday explanation:** Send an addressed datagram without a transport promise that it will arrive, arrive once, or arrive in order.

**Networking terms:** UDP has a small header and preserves datagram boundaries. UDP itself provides no retransmission, acknowledgement, or ordering service. Applications may add their own mechanisms.

**In PacketVerse:** The UDP loss scenario reports missing datagrams without automatic recovery. Chunk indices belong to this teaching application.

**Common mix-up:** UDP is not guaranteed to be faster in every circumstance. If an application adds retries, those retries are not UDP-provided reliability.

### TCP connection and ordered delivery

Coverage: **Partial model**

**Everyday explanation:** Number the bytes, acknowledge received progress, and recover missing information so the application sees an ordered stream.

**Networking terms:** TCP establishes connection state, uses byte-based sequence numbers and cumulative ACKs, and includes mechanisms for reliable ordered transport. A byte stream does not preserve application message boundaries.

**In PacketVerse:** Watch SYN, SYN-ACK, ACK, data, timeouts, duplicate handling, and reconstructed UTF-8 bytes.

**Common mix-up:** This is a documented TCP subset, omitting congestion control, full flow control, teardown, and other production mechanisms. A retry limit may still end the teaching experiment in failure.

### SCTP

Coverage: **Theory only**

**Everyday explanation:** Some applications want reliable messages and more than one stream within a communication association.

**Networking terms:** SCTP is a message-oriented transport with features including multistreaming and multihoming. Its association and chunk structure differ from TCP and UDP.

**In PacketVerse:** Use it as a comparison topic beside the implemented TCP and UDP modes. SCTP cannot be selected in this simulator.

**Common mix-up:** SCTP is not just TCP with another label, and multistreaming is not the same thing as sending every packet down multiple paths.

### Congestion control versus flow control

Coverage: **Theory only**

**Everyday explanation:** A crowded road is a network-capacity problem; a slow receiver is a receiver-capacity problem.

**Networking terms:** Congestion control regulates load to address network conditions. Flow control limits sending according to receiver capability. Loss and delay can be signals in real algorithms but are not interchangeable proof of one cause.

**In PacketVerse:** You can observe queueing, delay, and loss here, but no TCP congestion window or congestion-avoidance algorithm runs.

**Common mix-up:** The app’s retry behavior is reliability recovery, not a demonstration of TCP slow start or congestion avoidance.

### Quality of Service

Coverage: **Partial model**

**Everyday explanation:** Different conversations care about different things: a video call notices delay and variation; a file transfer needs correct complete bytes.

**Networking terms:** QoS concerns measurable service properties such as throughput, delay, jitter, and loss. Scheduling, shaping, admission, and resource management may support service goals.

**In PacketVerse:** The Metrics page calculates teaching goodput and event timing. It does not measure the real internet or implement a QoS policy.

**Common mix-up:** Goodput is useful application bytes per time; bandwidth is link capacity. One number does not summarize every QoS dimension.

### Leaky bucket

Coverage: **Theory only**

**Everyday explanation:** A buffer releases traffic at a controlled rate, like water leaving through a limited opening.

**Networking terms:** A leaky-bucket shaper smooths departures at a configured service rate; excess arriving traffic may be queued or discarded depending on its finite capacity and policy.

**In PacketVerse:** Compare the idea with waiting parcels, but a FIFO link queue here is not a separately configurable leaky-bucket shaper.

**Common mix-up:** A bucket’s capacity and its release rate are different parameters. Calling any queue a leaky bucket hides the actual policy.

### Token bucket

Coverage: **Theory only**

**Everyday explanation:** Save permission to send during quiet periods, then spend that permission on a limited burst.

**Networking terms:** Tokens accumulate at a configured rate up to a capacity. Sending consumes tokens according to a rule, allowing bounded bursts while constraining longer-term rate.

**In PacketVerse:** Use the worked idea of credits accumulating before a burst. The app does not maintain token balances.

**Common mix-up:** A token is permission under a traffic policy, not a data packet or a retransmission request.

### Worked example: A three-byte TCP message

1. For the ASCII text ABC, the application has three UTF-8 bytes.
2. In this teaching model, SYN uses sequence 1000 and consumes one position. The first data byte starts at sequence 1001.
3. After receiving bytes 1001, 1002, and 1003 in order, the receiver’s cumulative ACK names 1004: the next byte it expects.
4. If that ACK is lost, the sender may retransmit. The receiver must avoid delivering ABC twice.
5. Now compare UDP: it has no corresponding transport ACK/retry promise. An application may choose to add one itself.

### Revision prompts

- Explain application endpoints and ports.
- Compare TCP, UDP, and SCTP without claiming identical services.
- Distinguish congestion control from receiver flow control and reliability.
- Explain QoS properties and compare leaky-bucket with token-bucket behavior.

### Check your understanding

If an ACK says 1004 in this example, does it mean “packet number 1004 arrived”?

No. TCP ACKs refer to byte sequence space. Here 1004 is the next expected byte after the receiver has received all earlier bytes through 1003.

### Explore here

Run The missing receipt, inspect sequence and acknowledgement fields, then compare its outcome with the UDP loss scenario.


## Unit 5: The services people actually use

**How do names, web pages, files, mail and network management fit together?**

Lower layers move information. Application protocols give that movement a purpose: resolve a name, fetch a page, transfer a file, exchange mail, or manage devices. Security controls decide which communication is allowed.

### Application services and protocols

Coverage: **Theory only**

**Everyday explanation:** The network is useful because applications agree on meaningful requests and responses.

**Networking terms:** Application protocols define interactions for services such as name resolution, web access, messaging, and management. They use transport services while adding their own semantics.

**In PacketVerse:** Your entered text is application data, but the simulated topology does not implement these service protocols.

**Common mix-up:** A successful packet delivery does not prove that a website, mail server, or file service has accepted a valid application request.

### DNS

Coverage: **Theory only**

**Everyday explanation:** A name directory helps turn a human-friendly service name into records that applications can use.

**Networking terms:** DNS is a distributed hierarchical naming system with record types, resolvers, authoritative servers, and caching. Address records are one important use; DNS serves more than address lookup.

**In PacketVerse:** The app uses predefined numeric IPs. Sending does not perform DNS resolution inside the illustrated topology.

**Common mix-up:** DNS lookup is not routing, ARP, or automatic address allocation. Those answer different questions.

### Dynamic DNS

Coverage: **Theory only**

**Everyday explanation:** If an address changes, the name directory may need an update so later lookups can find the new information.

**Networking terms:** Dynamic DNS updates modify DNS data through defined update mechanisms or provider workflows. Cached information can persist until relevant caching behavior allows refresh.

**In PacketVerse:** Imagine Computer B’s address changing while a stable service name remains useful. The lab does not model these updates.

**Common mix-up:** Dynamic DNS and DHCP are different services, although systems may coordinate them.

### TELNET

Coverage: **Theory only**

**Everyday explanation:** A remote terminal lets a person interact with another machine’s command interface over a network.

**Networking terms:** TELNET defines terminal-oriented remote communication and negotiation. Classic TELNET does not provide modern encrypted protection for credentials and session contents.

**In PacketVerse:** Study the remote-terminal role conceptually. No remote login is performed by PacketVerse.

**Common mix-up:** Do not treat a classroom explanation as a recommendation to expose an insecure terminal service. SSH is a different protocol, not a TELNET mode.

### Electronic mail

Coverage: **Theory only**

**Everyday explanation:** Mail has several jobs: submitting a message, moving it between servers, and letting a recipient access a mailbox.

**Networking terms:** SMTP handles submission/transfer roles; POP3 and IMAP support mailbox access in different ways. Message content and transfer mechanisms are related but separate.

**In PacketVerse:** Think of multiple application exchanges layered over transport, rather than one universal “email packet”.

**Common mix-up:** SMTP, POP3, and IMAP are not three names for the same operation. TCP completion alone does not establish successful mail delivery.

### FTP

Coverage: **Theory only**

**Everyday explanation:** A file-transfer service needs commands as well as the file’s bytes.

**Networking terms:** FTP uses separate control and data connections; connection details depend on active/passive behavior and configuration. Classic FTP does not encrypt credentials or file contents.

**In PacketVerse:** Scenario JSON export is a browser download, not a simulated FTP session.

**Common mix-up:** FTP, FTPS, and SFTP are distinct. SFTP is associated with SSH and is not just FTP on a different port.

### WWW and HTTP

Coverage: **Theory only**

**Everyday explanation:** The web links resources; HTTP supplies request/response rules for accessing representations of them.

**Networking terms:** URLs identify resources, HTTP methods express actions, and responses have status information and content. HTTP versions differ in transport use; HTTPS adds protected communication using TLS in applicable stacks.

**In PacketVerse:** PacketVerse is served as a real local web page, but its miniature network does not generate HTTP requests or simulate TLS.

**Common mix-up:** The web and the internet are not synonyms. Not all HTTP versions use the same transport stack; HTTP/3 uses QUIC over UDP.

### SNMP

Coverage: **Theory only**

**Everyday explanation:** A network administrator needs a structured way to ask devices about counters, settings, and noteworthy events.

**Networking terms:** SNMP uses management roles and structured managed information, commonly organized with MIB definitions and object identifiers. Security properties depend on version and configuration.

**In PacketVerse:** The notebook’s counters suggest the sort of information a manager might want. They are not SNMP queries or responses.

**Common mix-up:** A metrics table is not evidence that SNMP is running. Management is also different from carrying an ordinary user message.

### Firewalls

Coverage: **Theory only**

**Everyday explanation:** A security checkpoint applies a policy about which communication may cross a boundary.

**Networking terms:** Firewalls can filter on properties such as addresses, ports, protocols, and connection state; capabilities vary by design and deployment.

**In PacketVerse:** Disabling a link removes connectivity. A real firewall could instead allow some traffic while rejecting other traffic on a working link.

**Common mix-up:** The app has no firewall rules engine. A dropped frame or disabled cable is not automatically a firewall decision, and firewalls are not complete security by themselves.

### Worked example: What happens when you ask for a web page?

1. Conceptually, a user chooses a URL and the application may need DNS records for its hostname, unless suitable information is already available.
2. The browser establishes the transport and security context appropriate to the HTTP version and configuration. For example, HTTPS over HTTP/1.1 or HTTP/2 commonly uses TLS over TCP.
3. The application exchanges HTTP requests and responses; IP routing and local link delivery carry the underlying traffic.
4. A firewall policy may permit or block selected communication while physical links remain operational.
5. PacketVerse currently demonstrates parts of the lower-layer journey. DNS, HTTP, TLS, mail, FTP, TELNET, SNMP, and firewall policy are explained here, not executed inside its scene.

### Revision prompts

- Distinguish an application protocol from its transport service.
- Explain DNS and dynamic updates; distinguish them from ARP and DHCP.
- Describe the roles of remote terminal access, mail protocols, file transfer, WWW, and HTTP.
- Explain network management with SNMP and policy enforcement with firewalls.

### Check your understanding

Does disabling Router 1’s cable demonstrate a firewall that blocks only web traffic?

No. A disabled cable prevents traffic from using that link. A selective firewall policy could block particular traffic while allowing other communication on the same working link. The app does not implement those policies.

### Explore here

Send a short application message and identify the lower layers carrying it. Use the guide to explain the additional application exchanges a real web or mail service would require.

## Protocol references

- [TCP: RFC 9293](https://www.rfc-editor.org/rfc/rfc9293.html)
- [UDP: RFC 768](https://www.rfc-editor.org/rfc/rfc768.html)
- [ARP: RFC 826](https://www.rfc-editor.org/rfc/rfc826.html)
- [DNS concepts: RFC 1034](https://www.rfc-editor.org/rfc/rfc1034.html)
