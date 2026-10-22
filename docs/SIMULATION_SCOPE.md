# What this model teaches—and its boundaries

This is an educational discrete-event simulation, not a real network emulator or RFC-compliant TCP implementation.

| Modeled                                                                                            | Explicit simplification / omission                                                                                                                                                                                        |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UTF-8 byte segmentation and exact reassembly                                                       | 512 application bytes per experiment; teaching MSS of 1–64 bytes                                                                                                                                                          |
| Ethernet source learning, broadcast/unknown flooding, known unicast                                | Loop-free LANs only; no spanning tree, VLANs, MAC aging, or physical errors                                                                                                                                               |
| ARP request/reply/cache updates                                                                    | A fixed 600 ms pending-resolution timeout, no production ARP state machine or cache expiry                                                                                                                                |
| IPv4 longest-prefix forwarding, endpoint addresses and TTL                                         | No ICMP, fragmentation, NAT, IPv6, DHCP, DNS, multicast, or policy routing                                                                                                                                                |
| Reachable routes derived using weighted Dijkstra                                                   | Centralized recomputation on link and delay changes; no distributed protocol, convergence messages, or convergence delay                                                                                                  |
| Ethernet serialization, propagation, FIFO direction queues                                         | FCS/header and minimum padding counted; no preamble/inter-frame gap, real CRC, or physical bit simulation                                                                                                                 |
| TCP SYN/SYN-ACK/ACK, byte sequences, cumulative ACKs, duplicates, reorder buffering, timeout retry | No congestion control, adaptive RTO, full receive-window/flow control, SACK, TCP options, TCP close, or RFC-compliance claim; per-segment timers and a small-message unlimited window; no autonomous server SYN-ACK timer |
| UDP ports, datagram length, independent datagram delivery                                          | Four bytes of application index/total metadata and app-level reassembly are explicitly not UDP features                                                                                                                   |
| Seeded per-link IP frame loss and one-shot data/ACK loss                                           | ARP frames are not randomly lost; one-shot drops affect the next eligible link transmission, including the final TCP handshake ACK if armed early                                                                         |
| Versioned topology/configuration import/export                                                     | Initial visual coordinates fit a fixed 1100×540 illustrated workspace; one interface per host (routers handle transit); topology editing uses JSON rather than drag-and-drop                                              |

In out-of-order demonstrations the application schedules the first data segment later. This is a controlled teaching intervention, not a claim that TCP intentionally reorders segments.

“Complete” for TCP requires both ordered application reconstruction and sender receipt of a covering ACK. If the receiver got bytes but all ACKs fail, the sender can still exhaust retries. UDP completion means all application datagrams arrived; loss produces an honest incomplete result.

Metrics are calculated from actual simulated events:

- Unique delivered application bytes do not count duplicates or protocol overhead.
- Data/ACK transmission counters count transport packet launches, not every Ethernet hop. ACK transmissions include the client’s final setup ACK.
- Drops count discarded Ethernet frames, IP packets with no usable route, and packets discarded from expired ARP pending queues. Retransmissions include data retries and initial connection retries.
- Completion time is measured from simulated experiment time zero, including ARP and TCP setup.
- Goodput is delivered unique application bytes divided by that full completion interval in seconds, shown in B/s. It is pending until completion.

All measurements describe this simulation. They are not internet benchmarks. Timing includes simplified ARP and queue behavior; changing playback speed does not change them.
