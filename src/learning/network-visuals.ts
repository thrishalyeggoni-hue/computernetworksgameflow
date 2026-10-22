/** Small, explicit concept stories. These illustrations are separate from the discrete-event lab. */
export interface VisualNode {
  label: string;
  sub?: string;
  icon?: string;
  tone?: string;
}
export interface VisualFrame {
  caption: string;
  nodes: VisualNode[];
  arrows?: string[];
  focus?: number;
  kind?: "flow" | "stack" | "topology" | "bands" | "bits";
  shape?: string;
}
export interface VisualStory {
  title: string;
  frames: VisualFrame[];
  takeaway: string;
}
const n = (label: string, sub = "", icon = "◇", tone = "blue"): VisualNode => ({
  label,
  sub,
  icon,
  tone,
});
const f = (
  caption: string,
  nodes: VisualNode[],
  arrows: string[] = [],
  focus = 0,
  kind: VisualFrame["kind"] = "flow",
  shape?: string,
): VisualFrame => ({ caption, nodes, arrows, focus, kind, shape });
const story = (
  title: string,
  takeaway: string,
  ...frames: VisualFrame[]
): VisualStory => ({ title, takeaway, frames });
export const visualUnits: VisualStory[][] = [
  [
    story(
      "A message needs five ingredients.",
      "Sender + message + medium + receiver + shared rules.",
      f(
        "Meet the sender and receiver.",
        [
          n("Computer A", "sender", "▣", "blue"),
          n("Hello!", "message", "✉", "pink"),
          n("Computer B", "receiver", "▣", "purple"),
        ],
        ["creates", "for"],
        0,
      ),
      f(
        "A medium carries it. A protocol supplies the rules.",
        [
          n("Computer A", "sender", "▣"),
          n("Ethernet link", "medium", "⌁", "mint"),
          n("Computer B", "receiver", "▣", "purple"),
        ],
        ["shared rules", "shared rules"],
        1,
      ),
      f(
        "The message reaches its destination.",
        [
          n("Computer A", "sent", "✓"),
          n("Hello!", "information carried", "✉", "pink"),
          n("Computer B", "received", "✓", "mint"),
        ],
        ["bits travel", "reconstruct"],
        2,
      ),
    ),
    story(
      "Data can travel in different directions.",
      "A character, a byte and a bit are different things.",
      f(
        "Text becomes bytes, then bits.",
        [
          n("A", "text character", "A", "pink"),
          n("65", "UTF-8 byte value", "65", "purple"),
          n("01000001", "8 bits", "01", "blue"),
        ],
        ["encode", "represent"],
        1,
      ),
      f(
        "Simplex: information travels one way.",
        [
          n("Sender", "only sends", "▣"),
          n("Receiver", "only receives", "▣", "pink"),
        ],
        ["one way →"],
        0,
      ),
      f(
        "Half-duplex: take turns. Full-duplex: both directions can operate together.",
        [
          n("Half-duplex", "A → B, then B → A", "⇄", "orange"),
          n("Full-duplex", "A ⇄ B concurrently", "⇆", "mint"),
        ],
        ["compare"],
        1,
      ),
    ),
    story(
      "Change the connection plan.",
      "The topology is the set of connections, not the background floor.",
      f(
        "Star: devices connect through a central point.",
        [n("A"), n("B"), n("C"), n("D"), n("Switch", "center", "▥", "mint")],
        [],
        4,
        "topology",
        "star",
      ),
      f(
        "Ring: each device connects to its neighbors in a loop.",
        [n("A"), n("B"), n("C"), n("D")],
        [],
        1,
        "topology",
        "ring",
      ),
      f(
        "Mesh: more connections create alternative paths.",
        [n("A"), n("B"), n("C"), n("D")],
        [],
        2,
        "topology",
        "mesh",
      ),
    ),
    story(
      "Agree on the rules.",
      "A working cable cannot fix incompatible message rules.",
      f(
        "Both ends understand the same format.",
        [
          n("Sender", "format: TYPE | DATA", "✉"),
          n("Protocol", "shared agreement", "≡", "mint"),
          n("Receiver", "reads TYPE | DATA", "✓", "purple"),
        ],
        ["uses", "understands"],
        1,
      ),
      f(
        "Different rules can make a message unreadable.",
        [
          n("Sender", "TYPE | DATA", "✉"),
          n("Mismatch", "format differs", "!", "red"),
          n("Receiver", "expects DATA | TYPE", "?", "orange"),
        ],
        ["arrives", "cannot interpret"],
        2,
      ),
    ),
    story(
      "Peel back the layers.",
      "Layers describe jobs. Not every OSI layer adds its own header.",
      f(
        "Start with the application’s message.",
        [
          "Application",
          "Presentation",
          "Session",
          "Transport",
          "Network",
          "Data link",
          "Physical",
        ].map((s, i) =>
          n(
            s,
            [
              "user service",
              "representation",
              "dialogue",
              "process to process",
              "between networks",
              "local frames",
              "signals",
            ][i],
            String(7 - i),
            ["pink", "purple", "blue", "orange", "purple", "mint", "blue"][i],
          ),
        ),
        [],
        0,
        "stack",
      ),
      f(
        "Transport serves applications; network chooses internetwork delivery.",
        [
          "Application",
          "Presentation",
          "Session",
          "Transport",
          "Network",
          "Data link",
          "Physical",
        ].map((s, i) =>
          n(
            s,
            [
              "message",
              "encoding",
              "conversation",
              "TCP / UDP",
              "IPv4",
              "Ethernet",
              "bits",
            ][i],
            String(7 - i),
          ),
        ),
        [],
        3,
        "stack",
      ),
      f(
        "A local frame finally becomes signals on a medium.",
        [
          "Application",
          "Presentation",
          "Session",
          "Transport",
          "Network",
          "Data link",
          "Physical",
        ].map((s, i) =>
          n(
            s,
            [
              "message",
              "encoding",
              "conversation",
              "TCP / UDP",
              "IPv4",
              "Ethernet",
              "signals",
            ][i],
            String(7 - i),
          ),
        ),
        [],
        6,
        "stack",
      ),
    ),
    story(
      "Choose what carries the signal.",
      "The medium carries signals; bandwidth and propagation are separate properties.",
      f(
        "Copper carries electrical signals.",
        [
          n("Computer", "bits", "▣"),
          n("Copper", "electrical signal", "ϟ", "orange"),
          n("Computer", "bits", "▣", "purple"),
        ],
        ["encode", "decode"],
        1,
      ),
      f(
        "Fiber carries light. Radio travels without a guiding cable.",
        [
          n("Fiber", "light pulses", "✦", "pink"),
          n("Radio", "electromagnetic waves", ")))", "blue"),
        ],
        ["two media"],
        1,
      ),
    ),
    story(
      "Two local networks, one larger journey.",
      "A switch handles local frames. A router joins IP networks.",
      f(
        "The switch moves frames within a wired LAN.",
        [
          n("PC A", "LAN 1", "▣"),
          n("Switch", "MAC → port", "▥", "mint"),
          n("PC C", "LAN 1", "▣", "pink"),
        ],
        ["Ethernet", "Ethernet"],
        1,
      ),
      f(
        "A router crosses between IP neighborhoods.",
        [
          n("LAN 1", "192.168.1.0/24", "▥", "blue"),
          n("Router", "IP forwarding", "↔", "purple"),
          n("LAN 2", "192.168.2.0/24", "▥", "orange"),
        ],
        ["local link", "new local link"],
        1,
      ),
      f(
        "A wireless LAN uses radio to reach an access point.",
        [
          n("Laptop", "Wi-Fi station", "▣", "pink"),
          n("Access point", "radio ↔ wired", ")))", "blue"),
          n("LAN", "local network", "▥", "mint"),
        ],
        ["radio", "Ethernet"],
        1,
      ),
    ),
    story(
      "Separate groups on shared equipment.",
      "VLANs split broadcast domains; crossing them needs routing.",
      f(
        "One physical switch can contain distinct logical groups.",
        [
          n("PC A", "VLAN 10", "▣", "blue"),
          n("PC B", "VLAN 10", "▣", "blue"),
          n("PC C", "VLAN 20", "▣", "pink"),
          n("PC D", "VLAN 20", "▣", "pink"),
        ],
        [],
        0,
        "bands",
      ),
      f(
        "A broadcast in VLAN 10 stays in that VLAN.",
        [
          n("VLAN 10", "broadcast ✓", ")))", "blue"),
          n("Boundary", "not bridged together", "|", "purple"),
          n("VLAN 20", "does not receive it", "—", "pink"),
        ],
        ["stops here", "separate group"],
        0,
      ),
    ),
    story(
      "Share the same resource three ways.",
      "Frequency bands, time slots and light wavelengths are different divisions.",
      f(
        "FDM: users occupy different frequency bands.",
        [
          n("User A", "frequency band 1", "A", "blue"),
          n("User B", "frequency band 2", "B", "pink"),
          n("User C", "frequency band 3", "C", "purple"),
        ],
        [],
        0,
        "bands",
      ),
      f(
        "TDM: users take assigned time slots.",
        [
          n("A", "time slot 1", "1", "blue"),
          n("B", "time slot 2", "2", "pink"),
          n("C", "time slot 3", "3", "purple"),
        ],
        ["then", "then"],
        1,
      ),
      f(
        "WDM: different wavelengths share an optical fiber.",
        [
          n("λ1", "light wavelength", "✦", "pink"),
          n("λ2", "light wavelength", "✦", "blue"),
          n("λ3", "light wavelength", "✦", "mint"),
        ],
        [],
        2,
        "bands",
      ),
    ),
    story(
      "Spread the radio signal.",
      "Spreading a signal is not the same thing as encrypting it.",
      f(
        "Frequency hopping changes channels according to an agreed pattern.",
        [
          n("t1: f2", "first hop", "1", "blue"),
          n("t2: f5", "second hop", "2", "pink"),
          n("t3: f1", "third hop", "3", "purple"),
        ],
        ["hop", "hop"],
        1,
      ),
      f(
        "Direct sequence combines data with a faster chip sequence.",
        [
          n("Data bit", "information", "1", "blue"),
          n("Spreading code", "many chips per bit", "10110", "purple"),
          n("Spread signal", "receiver uses matching code", "⌁", "mint"),
        ],
        ["combine", "recover"],
        1,
      ),
    ),
  ],
  [
    story(
      "Frames cross one local segment.",
      "MAC forwarding is local. IP routing is a different decision.",
      f(
        "The switch learns a source MAC on its incoming port.",
        [
          n("PC A", "source MAC A", "▣"),
          n("Switch", "learn A → port 1", "▥", "mint"),
          n("PC B", "destination MAC B", "▣", "pink"),
        ],
        ["incoming port", "outgoing port"],
        1,
      ),
      f(
        "A known destination is forwarded to its learned port.",
        [
          n("MAC B", "destination lookup", "B", "pink"),
          n("MAC table", "B → port 2", "≡", "mint"),
          n("Port 2", "forward frame", "→", "blue"),
        ],
        ["match", "send"],
        1,
      ),
    ),
    story(
      "Spot damage versus repair it.",
      "Detection says something is wrong; correction recovers a valid original within limits.",
      f(
        "The received bits differ from what was sent.",
        [
          n("1010", "sent", "01"),
          n("1000", "one bit changed", "!", "red"),
          n("Check", "detect inconsistency", "?", "orange"),
        ],
        ["channel", "inspect"],
        1,
      ),
      f(
        "A suitable correcting code can identify an original under a bounded-error assumption.",
        [
          n("Redundancy", "structured extra bits", "+", "purple"),
          n("Decoder", "assume limited errors", "↔", "orange"),
          n("Original", "recover when possible", "✓", "mint"),
        ],
        ["use", "correct"],
        1,
      ),
    ),
    story(
      "Add useful redundancy.",
      "A code defines valid patterns; arbitrary extra padding does not do that.",
      f(
        "A repetition code maps one data bit to three transmitted bits.",
        [
          n("0", "one data bit", "0", "blue"),
          n("000", "valid codeword", "000", "blue"),
          n("111", "other valid codeword", "111", "pink"),
        ],
        ["encode", "compare"],
        1,
      ),
      f(
        "Not every received three-bit pattern is a valid codeword.",
        [
          n("001", "received", "!", "red"),
          n("Valid set", "000 or 111", "≡", "purple"),
          n("Decision", "closer to 000", "✓", "mint"),
        ],
        ["check", "one-error assumption"],
        2,
      ),
    ),
    story(
      "Count the bit positions that differ.",
      "Minimum distance 3 can detect up to 2 errors or correct up to 1.",
      f(
        "000 and 111 differ in all three positions: distance = 3.",
        [
          n("000", "valid codeword", "000", "blue"),
          n("3 differences", "compare positions", "≠", "orange"),
          n("111", "valid codeword", "111", "pink"),
        ],
        ["0≠1", "0≠1"],
        1,
        "bits",
      ),
      f(
        "With at most one error, 001 is closer to 000 than to 111.",
        [
          n("001", "received", "001", "orange"),
          n("000: distance 1", "nearest codeword", "✓", "mint"),
          n("111: distance 2", "farther away", "2", "pink"),
        ],
        ["compare", "compare"],
        1,
        "bits",
      ),
    ),
    story(
      "A remainder that checks the bits.",
      "CRC detects specified error patterns. It is not encryption or automatic repair.",
      f(
        "For this tiny example, use data 1101 and generator 1011.",
        [
          n("1101", "data bits", "01"),
          n("1011", "agreed generator", "÷", "purple"),
          n("001", "CRC remainder", "001", "orange"),
        ],
        ["mod-2 division", "append remainder"],
        1,
        "bits",
      ),
      f(
        "The transmitted codeword 1101001 divides with remainder zero.",
        [
          n("1101001", "data + CRC", "01", "blue"),
          n("Divide by 1011", "receiver check", "÷", "purple"),
          n("000", "check passes", "✓", "mint"),
        ],
        ["divide", "remainder"],
        2,
        "bits",
      ),
      f(
        "An altered codeword can produce a nonzero remainder.",
        [
          n("1101000", "last bit changed", "!", "red"),
          n("Divide by 1011", "same generator", "÷", "purple"),
          n("001", "error detected", "!", "red"),
        ],
        ["check", "nonzero"],
        2,
        "bits",
      ),
    ),
    story(
      "Two different problems to solve.",
      "Flow control protects the receiver. Error control deals with delivery problems.",
      f(
        "A receiver with room for two frames should not be overwhelmed by a burst of five.",
        [
          n("Sender", "wants to send 5", "5"),
          n("Receiver buffer", "room for 2", "2", "orange"),
          n("Flow control", "limit outstanding data", "✋", "mint"),
        ],
        ["capacity mismatch", "regulate"],
        1,
      ),
      f(
        "A missing frame needs a different response.",
        [
          n("Frame 1", "missing", "×", "red"),
          n("Timeout / ACK", "detect missing progress", "◷", "orange"),
          n("Retry", "recover data", "↻", "mint"),
        ],
        ["notice", "respond"],
        1,
      ),
    ),
    story(
      "One outstanding frame at a time.",
      "Stop-and-Wait waits for a receipt before advancing.",
      f(
        "Send frame 0. Frame 1 stays at the sender.",
        [
          n("Sender", "frame 1 waiting", "▣"),
          n("Frame 0", "travels to receiver", "0", "blue"),
          n("Receiver", "accepts 0", "▣", "mint"),
        ],
        ["send", "arrives"],
        1,
      ),
      f(
        "The receiver sends an acknowledgement.",
        [
          n("Receiver", "frame 0 accepted", "✓", "mint"),
          n("ACK 0", "receipt for frame 0", "✉", "mint"),
          n("Sender", "receives receipt", "▣", "blue"),
        ],
        ["send receipt", "arrives"],
        1,
      ),
      f(
        "Only now send the next frame.",
        [
          n("Sender", "advance", "▣"),
          n("Frame 1", "next outstanding frame", "1", "pink"),
          n("Receiver", "next delivery", "▣", "mint"),
        ],
        ["send", "arrives"],
        1,
      ),
    ),
    story(
      "Several frames can be on the way.",
      "A window limits the outstanding sequence range.",
      f(
        "A three-frame sender window permits 0, 1 and 2.",
        [
          n("0", "in window", "0", "blue"),
          n("1", "in window", "1", "blue"),
          n("2", "in window", "2", "blue"),
          n("3", "not yet permitted", "3", "purple"),
        ],
        [],
        1,
        "bands",
      ),
      f(
        "Acknowledged progress lets the window slide forward.",
        [
          n("0", "acknowledged", "✓", "mint"),
          n("1", "outstanding", "1", "blue"),
          n("2", "outstanding", "2", "blue"),
          n("3", "now permitted", "3", "pink"),
        ],
        [],
        3,
        "bands",
      ),
    ),
    story(
      "Go back from the missing frame.",
      "Basic Go-Back-N discards later out-of-order frames.",
      f(
        "Frame 1 is lost. Later frames arrive out of order.",
        [
          n("0", "accepted", "✓", "mint"),
          n("1", "lost", "×", "red"),
          n("2", "discarded", "×", "orange"),
          n("3", "discarded", "×", "orange"),
        ],
        [],
        1,
        "bands",
      ),
      f(
        "After timeout, retransmit 1 and subsequent outstanding frames.",
        [
          n("0", "already accepted", "✓", "mint"),
          n("1", "retry", "↻", "orange"),
          n("2", "retry", "↻", "orange"),
          n("3", "retry", "↻", "orange"),
        ],
        [],
        1,
        "bands",
      ),
    ),
    story(
      "Keep the good frames. Retry the gap.",
      "Selective Repeat uses selective acknowledgements and buffering.",
      f(
        "Frame 1 is missing, but 2 and 3 can be buffered.",
        [
          n("0", "accepted", "✓", "mint"),
          n("1", "missing", "×", "red"),
          n("2", "buffered", "2", "purple"),
          n("3", "buffered", "3", "purple"),
        ],
        [],
        1,
        "bands",
      ),
      f(
        "Retry only frame 1, then release the ordered sequence.",
        [
          n("1", "retry only this", "↻", "orange"),
          n("Buffer", "already has 2 and 3", "▤", "purple"),
          n("Application", "0, 1, 2, 3 in order", "✓", "mint"),
        ],
        ["fills gap", "release"],
        0,
      ),
    ),
    story(
      "Put the receipt in the return message.",
      "Piggybacking combines acknowledgement information with reverse data.",
      f(
        "A receives B’s data and has data to send back.",
        [
          n("B", "sent data", "▣", "pink"),
          n("A", "has reverse data", "▣", "blue"),
        ],
        ["data →"],
        1,
      ),
      f(
        "A’s return frame carries both data and acknowledgement information.",
        [
          n("A", "reply ready", "▣"),
          n("Data + ACK", "one return frame", "✉", "mint"),
          n("B", "gets data and receipt", "▣", "pink"),
        ],
        ["send", "receive"],
        1,
      ),
    ),
    story(
      "Shared-channel attempts can overlap.",
      "Slotted ALOHA restricts starting times; it does not eliminate collisions.",
      f(
        "Pure ALOHA: attempts may begin at arbitrary times and overlap.",
        [
          n("A", "starts now", "A", "blue"),
          n("Overlap", "collision", "×", "red"),
          n("B", "starts soon after", "B", "pink"),
        ],
        ["shared channel", "overlap"],
        1,
      ),
      f(
        "Slotted ALOHA: start at slot boundaries; same-slot attempts can still collide.",
        [
          n("Slot 1", "A succeeds", "A", "mint"),
          n("Slot 2", "A + B collide", "×", "red"),
          n("Slot 3", "retry later", "↻", "purple"),
        ],
        ["next slot", "next slot"],
        1,
      ),
    ),
    story(
      "Three channel-sharing ideas—not synonyms.",
      "The syllabus prints “CDMA/CA”; distinguish CSMA/CA from CDMA.",
      f(
        "CSMA/CD: shared half-duplex Ethernet detects a collision, then backs off.",
        [
          n("Listen", "carrier sense", "◉"),
          n("Collision", "detect", "×", "red"),
          n("Back off", "retry later", "◷", "orange"),
        ],
        ["may transmit", "if collision"],
        1,
      ),
      f(
        "CSMA/CA: wireless access uses avoidance mechanisms before transmission.",
        [
          n("Listen", "channel state", "◉"),
          n("Wait / back off", "reduce conflict", "◷", "orange"),
          n("Transmit", "still no absolute guarantee", "→", "mint"),
        ],
        ["coordinate", "attempt"],
        1,
      ),
      f(
        "CDMA separates users by code, not by collision detection.",
        [
          n("User A", "code A", "A", "blue"),
          n("User B", "code B", "B", "pink"),
          n("Receiver", "separate by codes", "≡", "purple"),
        ],
        ["combined channel", "decode"],
        2,
      ),
    ),
  ],
  [
    story(
      "Choose how a network shares its paths.",
      "A packet-switched journey does not reserve a whole circuit for your message.",
      f(
        "Circuit switching reserves a path for a conversation.",
        [
          n("A", "caller", "▣"),
          n("Reserved circuit", "resources allocated", "━", "mint"),
          n("B", "receiver", "▣", "pink"),
        ],
        ["dedicated path", "during connection"],
        1,
      ),
      f(
        "Packet switching lets different packets share links.",
        [
          n("Packet A1", "one flow", "1", "blue"),
          n("Shared link", "mixed packets", "▦", "purple"),
          n("Packet B1", "another flow", "1", "pink"),
        ],
        ["interleave", "interleave"],
        1,
      ),
      f(
        "Message switching stores and forwards the whole message.",
        [
          n("Whole message", "not small packets", "▤", "blue"),
          n("Intermediate store", "wait for whole message", "▤", "orange"),
          n("Next hop", "forward message", "→", "mint"),
        ],
        ["store", "forward"],
        1,
      ),
    ),
    story(
      "The most specific matching prefix wins.",
      "An IPv4 address has 32 bits; a prefix identifies matching network bits.",
      f(
        "A packet for 192.168.2.20 matches several entries.",
        [
          n("/0", "default route", "0", "blue"),
          n("192.168.0.0/16", "broader match", "16", "purple"),
          n("192.168.2.0/24", "most specific match", "24", "mint"),
        ],
        [],
        2,
        "bands",
      ),
      f(
        "Use the /24 entry’s next hop rather than the less specific matches.",
        [
          n("192.168.2.20", "destination IP", "▣"),
          n("/24 route", "selected entry", "✓", "mint"),
          n("Output interface", "forward packet", "→", "purple"),
        ],
        ["longest match", "next hop"],
        1,
      ),
    ),
    story(
      "IPv6 uses a larger address space.",
      "IPv6 neighbor discovery is not IPv4 ARP.",
      f(
        "IPv6 addresses contain 128 bits, often written as hexadecimal groups.",
        [
          n("2001:db8", "illustrative prefix", "16", "blue"),
          n("0:0:0:0", "middle groups", "16", "purple"),
          n("0:1", "last groups", "16", "pink"),
        ],
        ["8 groups total", "16 bits each"],
        0,
      ),
      f(
        "IPv4 uses ARP in Ethernet; IPv6 uses neighbor-discovery mechanisms.",
        [
          n("IPv4", "32-bit address + ARP", "4", "blue"),
          n("IPv6", "128-bit address + ND", "6", "purple"),
        ],
        ["different protocols"],
        1,
      ),
    ),
    story(
      "Ask for the local next hop’s MAC.",
      "For a remote destination, resolve the gateway MAC—not the remote host’s MAC.",
      f(
        "A asks its local network: who has gateway IP 192.168.1.1?",
        [
          n("Computer A", "ARP request", "?"),
          n("Local broadcast", "who has this IP?", ")))", "orange"),
          n("Gateway", "owns 192.168.1.1", "↔", "purple"),
        ],
        ["broadcast", "recognizes IP"],
        1,
      ),
      f(
        "The gateway replies. A caches the mapping.",
        [
          n("Gateway", "my MAC is G", "↔", "purple"),
          n("ARP reply", "IP → MAC", "✉", "mint"),
          n("A’s cache", "192.168.1.1 → G", "≡", "blue"),
        ],
        ["reply", "remember"],
        2,
      ),
    ),
    story(
      "Learn configuration, not a route.",
      "ARP, RARP, BOOTP and DHCP answer different questions.",
      f(
        "RARP historically used a hardware identity to seek an IP address.",
        [
          n("Client MAC", "known identity", "▣"),
          n("RARP server", "mapping lookup", "≡", "purple"),
          n("Client IP", "learn address", "✓", "mint"),
        ],
        ["request", "response"],
        1,
      ),
      f(
        "BOOTP supplies bootstrap configuration.",
        [
          n("Starting client", "needs settings", "▣"),
          n("BOOTP server", "bootstrap information", "▤", "purple"),
          n("Client", "uses configuration", "✓", "mint"),
        ],
        ["request", "configuration"],
        1,
      ),
      f(
        "DHCP supplies leased configuration.",
        [
          n("Discover / offer", "find a server", "?", "blue"),
          n("Request / ACK", "agree on settings", "✉", "purple"),
          n("Lease", "address, gateway, etc.", "◷", "mint"),
        ],
        ["request", "configure"],
        2,
      ),
    ),
    story(
      "Plan a route, then forward each packet.",
      "Route computation builds information; forwarding applies it locally.",
      f(
        "Routing determines usable paths and forwarding information.",
        [
          n("Topology", "available links", "⌘"),
          n("Route computation", "choose usable paths", "↔", "purple"),
          n("Forwarding table", "prefix → next hop", "≡", "mint"),
        ],
        ["input", "produce"],
        1,
      ),
      f(
        "Forwarding looks up one packet’s destination and chooses a local output.",
        [
          n("IP packet", "destination", "✉"),
          n("Table lookup", "longest prefix", "≡", "mint"),
          n("Next interface", "one hop", "→", "purple"),
        ],
        ["match", "send"],
        1,
      ),
    ),
    story(
      "Keep the IP destination; change local wrappers.",
      "No NAT here: endpoint IPs stay fixed while Ethernet MACs change.",
      f(
        "First LAN: A addresses a frame to gateway G1.",
        [
          n("IP A → B", "endpoints stay fixed", "✉"),
          n("MAC A → G1", "local Ethernet wrapper", "▱", "mint"),
          n("TTL 16", "before router", "16", "purple"),
        ],
        ["inside", "packet field"],
        1,
      ),
      f(
        "Next routed segment: new MAC addresses, and TTL is decremented.",
        [
          n("IP A → B", "same endpoints", "✉"),
          n("MAC R1 → R2", "new local wrapper", "▱", "orange"),
          n("TTL 15", "after forwarding", "15", "purple"),
        ],
        ["inside", "one routed hop"],
        1,
      ),
      f(
        "Destination LAN: the final frame uses B’s local MAC.",
        [
          n("IP A → B", "same endpoints", "✉"),
          n("MAC G2 → B", "last local wrapper", "▱", "pink"),
          n("TTL 14", "another routed hop", "14", "purple"),
        ],
        ["inside", "receive"],
        1,
      ),
    ),
  ],
  [
    story(
      "Find the right application, not just the computer.",
      "IP identifies an endpoint host; transport ports help identify communication endpoints.",
      f(
        "The destination IP gets traffic to the destination host.",
        [
          n("Computer A", "source IP", "▣"),
          n("Computer B", "destination IP", "▣", "purple"),
        ],
        ["routed packet"],
        1,
      ),
      f(
        "The transport destination port selects the intended endpoint.",
        [
          n("Port 49152", "sender endpoint", "▣", "blue"),
          n("IP network", "carries transport data", "⌘", "mint"),
          n("Port 8080", "receiver endpoint", "▣", "pink"),
        ],
        ["source port", "destination port"],
        2,
      ),
    ),
    story(
      "Independent datagrams. No delivery promise.",
      "UDP itself does not acknowledge, reorder or retry datagrams.",
      f(
        "Send three datagrams independently.",
        [
          n("Datagram 1", "sent", "1", "blue"),
          n("Datagram 2", "lost", "×", "red"),
          n("Datagram 3", "received", "3", "purple"),
        ],
        [],
        1,
        "bands",
      ),
      f(
        "UDP does not automatically fill the missing gap.",
        [
          n("Received", "1, gap, 3", "▤", "purple"),
          n("UDP retry", "none supplied", "—", "orange"),
          n("Application", "decides what to do", "?", "pink"),
        ],
        ["observe", "own policy"],
        1,
      ),
    ),
    story(
      "TCP counts bytes and acknowledges progress.",
      "The ACK names the next expected byte—not a packet number.",
      f(
        "Connection setup: SYN, SYN-ACK, ACK travel through the network.",
        [
          n("SYN", "client starts", "→", "blue"),
          n("SYN-ACK", "server responds", "⇄", "purple"),
          n("ACK", "client acknowledges", "✓", "mint"),
        ],
        ["response", "acknowledge"],
        1,
      ),
      f(
        "For ABC after SYN 1000, data starts at byte sequence 1001.",
        [
          n("A", "sequence 1001", "A", "blue"),
          n("B", "sequence 1002", "B", "pink"),
          n("C", "sequence 1003", "C", "purple"),
        ],
        ["next byte", "next byte"],
        1,
      ),
      f(
        "After all three bytes arrive, cumulative ACK 1004 names the next byte.",
        [
          n("ABC", "received in order", "✓", "mint"),
          n("ACK 1004", "next expected byte", "✉", "mint"),
          n("Sender", "stops covered timers", "◷", "blue"),
        ],
        ["acknowledge", "delivered ACK"],
        1,
      ),
    ),
    story(
      "Reliable messages in multiple streams.",
      "SCTP preserves messages and can provide separate streams within an association.",
      f(
        "Different streams carry independently sequenced messages.",
        [
          n("Stream A", "A1, A2, A3", "A", "blue"),
          n("Stream B", "B1, B2, B3", "B", "pink"),
        ],
        ["one association"],
        0,
      ),
      f(
        "A missing message on one stream need not block delivery on every other stream.",
        [
          n("Stream A", "A2 missing: recover", "×", "red"),
          n("Stream B", "B1, B2 can progress", "✓", "mint"),
        ],
        ["distinct delivery streams"],
        1,
      ),
    ),
    story(
      "A crowded road is not a slow receiver.",
      "Congestion control, flow control and loss recovery are distinct responsibilities.",
      f(
        "Many senders overload network capacity: congestion.",
        [
          n("Many senders", "offered traffic", "▦", "pink"),
          n("Bottleneck", "capacity exceeded", "!", "red"),
          n("Congestion control", "regulate load", "✋", "orange"),
        ],
        ["too much traffic", "respond"],
        1,
      ),
      f(
        "One receiver runs out of buffer space: receiver flow control.",
        [
          n("Sender", "available data", "▣"),
          n("Receiver", "little free buffer", "2", "orange"),
          n("Flow control", "respect capacity", "✋", "mint"),
        ],
        ["send carefully", "regulate"],
        1,
      ),
    ),
    story(
      "Different jobs care about different qualities.",
      "QoS considers delay, jitter, loss and throughput—not just one speed number.",
      f(
        "A live call is sensitive to delay and variation in arrival time.",
        [
          n("Voice call", "real-time interaction", "◉", "pink"),
          n("Delay / jitter", "timing matters", "◷", "orange"),
          n("Experience", "smooth conversation", "✓", "mint"),
        ],
        ["needs", "affects"],
        1,
      ),
      f(
        "A file transfer needs complete correct bytes and useful throughput.",
        [
          n("File", "all data required", "▤", "blue"),
          n("Reliability + goodput", "correct useful bytes / s", "≡", "purple"),
          n("Result", "complete file", "✓", "mint"),
        ],
        ["needs", "produces"],
        1,
      ),
    ),
    story(
      "Release queued traffic at a controlled rate.",
      "A leaky-bucket shaper smooths departures; finite capacity can overflow.",
      f(
        "Illustration: six units arrive; release two per tick.",
        [
          n("Input", "burst of 6", "6", "pink"),
          n("Bucket", "queue = 6", "▤", "blue"),
          n("Output rate", "2 per tick", "2", "mint"),
        ],
        ["queue", "controlled release"],
        1,
      ),
      f(
        "After one tick: two released, four still waiting.",
        [
          n("Bucket", "queue = 4", "4", "blue"),
          n("Output", "2 released", "2", "mint"),
        ],
        ["one tick"],
        0,
      ),
      f(
        "Capacity example: ten units arrive at an empty six-unit bucket; four overflow.",
        [
          n("Input", "10 units", "10", "pink"),
          n("Capacity 6", "6 admitted", "6", "blue"),
          n("Overflow", "4 discarded", "×", "red"),
        ],
        ["finite queue", "excess"],
        2,
      ),
    ),
    story(
      "Save credits, then spend them on a burst.",
      "A token bucket permits bounded bursts while constraining longer-term rate.",
      f(
        "Tokens accumulate up to the configured capacity.",
        [
          n("Token rate", "1 per tick", "+", "blue"),
          n("Bucket capacity", "up to 3 tokens", "3", "purple"),
        ],
        ["wait 3 ticks"],
        1,
      ),
      f(
        "Three saved tokens permit a three-unit burst in this illustration.",
        [
          n("Tokens", "3 available", "3", "purple"),
          n("Traffic", "3 units sent", "→", "pink"),
          n("Tokens left", "0", "0", "orange"),
        ],
        ["spend", "consume"],
        1,
      ),
      f(
        "With no tokens left, more traffic must wait or be handled by policy.",
        [
          n("New traffic", "wants to send", "✉", "pink"),
          n("Tokens", "0 available", "0", "orange"),
          n("Wait", "accumulate credits", "◷", "mint"),
        ],
        ["check", "not yet permitted"],
        2,
      ),
    ),
  ],
  [
    story(
      "The application gives the trip a purpose.",
      "Correct packet delivery does not prove a valid application request succeeded.",
      f(
        "Applications agree on meaningful requests and responses.",
        [
          n("Client", "asks for a resource", "?", "blue"),
          n("Application protocol", "request / response rules", "≡", "purple"),
          n("Server", "interprets request", "▣", "pink"),
        ],
        ["request", "response"],
        1,
      ),
      f(
        "Lower layers carry the conversation.",
        [
          n("Application meaning", "what is requested", "?", "pink"),
          n("Transport + network", "carry information", "✉", "blue"),
          n("Application result", "accepted or rejected", "✓", "mint"),
        ],
        ["encode", "interpret"],
        2,
      ),
    ),
    story(
      "Find records for a name.",
      "DNS lookup, IP routing and ARP solve different problems.",
      f(
        "The application asks a resolver about a hostname.",
        [
          n("example.org", "human-friendly name", "?", "blue"),
          n("Resolver", "cache or lookup", "≡", "purple"),
          n("DNS records", "addresses and other data", "▤", "mint"),
        ],
        ["query", "answer"],
        1,
      ),
      f(
        "After obtaining an address, routing and local delivery still have work to do.",
        [
          n("DNS result", "destination information", "▤", "mint"),
          n("Routing", "next-hop decisions", "↔", "purple"),
          n("ARP", "local IP → MAC", "≡", "orange"),
        ],
        ["then", "where needed"],
        1,
      ),
    ),
    story(
      "Update a name when its address changes.",
      "Dynamic DNS updates directory data; existing caches may not refresh immediately.",
      f(
        "A service name points to an old address.",
        [
          n("service.example", "stable name", "▤", "blue"),
          n("DNS record", "old address", "1", "orange"),
        ],
        ["currently points to"],
        1,
      ),
      f(
        "An update changes the authoritative record.",
        [
          n("Update", "new address", "↻", "pink"),
          n("Authoritative DNS", "record replaced", "≡", "purple"),
          n("Caches", "refresh according to caching", "◷", "orange"),
        ],
        ["apply", "may take time"],
        1,
      ),
    ),
    story(
      "A remote terminal is a network service.",
      "Classic TELNET does not encrypt credentials or session content.",
      f(
        "A terminal sends commands to a remote computer.",
        [
          n("Terminal", "commands", ">_", "blue"),
          n("TELNET session", "remote interaction", "⌁", "orange"),
          n("Remote host", "executes commands", "▣", "purple"),
        ],
        ["send", "respond"],
        1,
      ),
      f(
        "Classic TELNET lacks modern encrypted protection.",
        [
          n("Credentials", "can be exposed", "!", "red"),
          n("Unencrypted channel", "no confidentiality", "⌁", "orange"),
          n("SSH", "a different secure protocol", "◆", "mint"),
        ],
        ["risk", "contrast"],
        1,
      ),
    ),
    story(
      "Sending mail and reading a mailbox are different jobs.",
      "SMTP transfers mail; IMAP and POP3 provide mailbox-access functions.",
      f(
        "SMTP handles submission and movement between mail servers.",
        [
          n("Sender", "compose message", "✉", "pink"),
          n("Mail servers", "SMTP transfer", "↔", "purple"),
          n("Mailbox", "stored message", "▤", "mint"),
        ],
        ["submit", "deliver to mailbox"],
        1,
      ),
      f(
        "The recipient uses a mailbox-access protocol.",
        [
          n("Mailbox", "stored messages", "▤", "mint"),
          n("IMAP / POP3", "mailbox access", "↔", "blue"),
          n("Recipient", "read message", "✉", "pink"),
        ],
        ["access", "retrieve / synchronize"],
        1,
      ),
    ),
    story(
      "A file transfer has control and data.",
      "FTP is not the same protocol as SFTP.",
      f(
        "FTP commands use a control connection.",
        [
          n("FTP client", "commands", ">_", "blue"),
          n("Control connection", "session instructions", "≡", "purple"),
          n("FTP server", "responds", "▣", "pink"),
        ],
        ["command", "response"],
        1,
      ),
      f(
        "File bytes travel on a separate data connection.",
        [
          n("File", "payload bytes", "▤", "pink"),
          n("Data connection", "separate from control", "→", "blue"),
          n("Destination", "received file", "✓", "mint"),
        ],
        ["transfer", "store"],
        1,
      ),
    ),
    story(
      "A browser asks for a web resource.",
      "The web is one internet service; HTTP versions differ in transport use.",
      f(
        "HTTP expresses a request and response for a resource.",
        [
          n("Browser", "GET /page", "?", "blue"),
          n("Web server", "HTTP response", "▣", "purple"),
          n("Resource", "content + status", "▤", "pink"),
        ],
        ["request", "response"],
        1,
      ),
      f(
        "Typical HTTPS over HTTP/2 uses TLS over TCP. HTTP/3 uses QUIC over UDP.",
        [
          n("HTTP/2 HTTPS", "HTTP → TLS → TCP", "◆", "purple"),
          n("HTTP/3", "HTTP → QUIC → UDP", "◆", "blue"),
        ],
        ["different stacks"],
        1,
      ),
    ),
    story(
      "Ask a managed device about its state.",
      "Displaying counters in this app is not the same as sending SNMP messages.",
      f(
        "A manager asks an agent for a managed value.",
        [
          n("Manager", "management request", "?", "blue"),
          n("Device agent", "managed information", "▣", "purple"),
          n("Counter", "example: packets received", "123", "mint"),
        ],
        ["query", "read value"],
        1,
      ),
      f(
        "The agent returns information defined by the management model.",
        [
          n("Agent", "value response", "✉", "purple"),
          n("Manager", "display / analyze", "▤", "blue"),
        ],
        ["reply"],
        1,
      ),
    ),
    story(
      "A policy can allow one flow and block another.",
      "A firewall rule is different from disabling a physical link.",
      f(
        "Illustrative policy: allow TCP destination port 443.",
        [
          n("TCP :443", "permitted flow", "✉", "blue"),
          n("Firewall", "allow rule", "✓", "mint"),
          n("Server", "connection may proceed", "▣", "purple"),
        ],
        ["policy check", "allow"],
        1,
      ),
      f(
        "The same working link can carry traffic that a policy denies.",
        [
          n("TCP :23", "different flow", "✉", "orange"),
          n("Firewall", "deny rule", "×", "red"),
          n("Server", "no delivery of denied flow", "—", "purple"),
        ],
        ["policy check", "blocked"],
        1,
      ),
    ),
  ],
];
