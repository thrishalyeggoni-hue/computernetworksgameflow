# Architecture and protocol behavior

## A deterministic network, then a view of it

`simulate(config, topology)` validates inputs, clones the topology, creates a stable binary-heap scheduler and seeded random generator, and returns an immutable trace. The simulation uses milliseconds. No browser or animation state participates in protocol decisions.

An event includes ID, simulated timestamp, reason, current status, metrics, delivered ordered bytes, ARP caches, MAC tables, forwarding tables, and actual frame/packet fields where applicable. Transmissions also identify source/destination device, cable, and arrival time. Static art is cached; one animation loop consumes the trace with a device-pixel-ratio-aware canvas.

`NetworkPlayback` controls which events are visible. Pause stops its clock; Next Event advances its event cursor. Scrubbing uses timestamp binary search. Animation speed changes this clock only. Replay uses the same trace. Notebook selection can pin an older snapshot independently of playback.

A live intervention reruns from the same initial topology/configuration/seed with a new timed fault. It preserves playback time and pause state. Faults are applied at explicit simulated timestamps, not arbitrary animation frames. Scenario changes reset the run. Future events and final metrics are not displayed before their simulated timestamps.

## Addressing and forwarding

The initial primary path is Computer A → Switch A → Router 1 → Router 2 → Switch B → Computer B. Router 3 provides an alternative path. Every cable joins two unique explicit interface IDs. Hosts and routers have MAC, IPv4, and prefix-length fields. Hosts have local gateways. Switch ports are unnumbered layer-2 interfaces.

A host chooses its connected route or default gateway using longest-prefix matching. A router decrements TTL and applies longest-prefix forwarding. A simplified centralized controller derives reachable subnet routes using Dijkstra over up links; edge weights are propagation plus serialization of a 64-byte reference frame. It recomputes when a timed link toggle or propagation-delay change occurs. Parallel cables retain their link identities and costs, and router next hops can be resolved across intermediate Ethernet switches. Hosts do not forward transit traffic. This is explicitly not a distributed routing protocol.

Before an IP packet enters an Ethernet segment, ARP resolves the next hop. Requests are broadcast; replies and data use learned MACs. A switch learns the source MAC on its receiving port, forwards known destinations, and floods broadcast or unknown unicast to other ports. Imported layer-2 cycles are rejected because spanning tree is not implemented. Routers preserve endpoint IPs and replace Ethernet source/destination MACs at each routed hop.

Each cable has independent full-duplex FIFO directions. Serialization uses padded Ethernet byte length and configured bit/s bandwidth; arrival adds propagation delay. Capacity is a teaching cap on frames occupying/waiting for a direction. Frames affected by an in-flight link failure are discarded even if the link returns before arrival. ARP resolution queues have a fixed teaching timeout.

## TCP teaching subset

Client ISN is 1000 and server ISN is 5000. SYN consumes one sequence number. SYN, SYN-ACK, and the final ACK each traverse the normal network. After receiving SYN-ACK, the sender sends the final ACK and may immediately send application data. The receiver enters established state when the standalone ACK or a data segment carrying that ACK actually arrives. A lost final ACK can therefore be recovered by subsequent data; the sender never reads remote receiver state to decide when to start. Initial connection attempts use a retransmission timer and retry limit. A separate server SYN-ACK retransmission timer is outside this subset; duplicate SYNs trigger another SYN-ACK.

Application bytes use small configured MSS boundaries, even inside a multibyte character. The sender uses per-segment teaching timers and an unbounded small teaching window. The receiver buffers out-of-order byte sequences, delivers only a contiguous prefix, discards duplicate delivery, and emits cumulative ACKs naming its next expected byte. ACKs traverse ARP, switches, routers, and cables. Only ACK arrival at the sender advances acknowledgement state and invalidates covered timers.

A timer token plus the acknowledged byte boundary prevents stale retransmission callbacks from retrying acknowledged bytes. Retry exhaustion yields an explicit failure. Completion requires full receiver reassembly and a covering ACK at the sender. Payloads are decoded only after complete ordered byte reconstruction.

## UDP teaching application

Each datagram has ports, payload, and four modeled bytes of application metadata (two 16-bit fields: index and total). This metadata and message reassembly are application behavior, not UDP behavior. UDP length includes these metadata bytes plus its eight-byte header. Unique application-byte metrics exclude the metadata.

The receiver buffers by application index. If every datagram arrives, it reconstructs and decodes ordered bytes. If any are missing, it reports incomplete delivery and does not decode a misleading partial message. UDP never generates transport acknowledgements or automatic retransmissions.

## Persistence, input, and lifecycle

Version-1 JSON includes topology and configuration. Import validates device kinds, IDs, positions, IPs, subnet lengths, MAC uniqueness, links, exclusive port use, bandwidth/delay bounds, queue capacities, loop-free Ethernet structure, endpoint selection, message length, and fault references. Invalid configurations produce a visible explanation.

Namespaced local storage keeps display/audio preferences, network preferences, notebook page, and chapter progress. The application works if storage is unavailable. Sound is opt-in, starts on a gesture, limits each tone’s lifetime, and disconnects nodes afterward. The resize observer, canvas listener, animation frame, and audio context are cleaned up on page exit.

## Debug audit fixes

Rendering receives only the event prefix revealed by playback, so stepping within a shared timestamp does not leak later events. Invalid message submissions leave the previous valid run and its notebook configuration intact. Live interventions validate a candidate configuration before replacing a trace and clear obsolete pinned event objects. Opening a dialog pauses playback. Event-list updates preserve keyboard focus; device inspection reopens a hidden notebook. Clearing saved lesson progress exits the active lesson so an old completed trace cannot immediately re-award it. Preset scenarios restore their known laboratory topology; imported experiments are labeled separately.
