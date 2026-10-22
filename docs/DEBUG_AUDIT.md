# PacketVerse debug audit

The audit rechecked the actual simulation, controls, scenario import/export, persistence, notebook, lesson objectives, keyboard interaction, narrow layouts, and production output.

## Fixed

- Forwarding tables now recompute after propagation-delay changes, use weighted route costs, preserve cheaper parallel-link identity, and resolve router next hops through Ethernet switches.
- TCP data starts at the sender on SYN-ACK receipt. Receiver establishment depends on an ACK arriving through the network, including a data segment carrying the final ACK. No remote-state shortcut gates sender transmission.
- Imported topologies reject unsupported multihomed hosts, duplicate MAC addresses differing only in case, multicast/broadcast/zero source MACs, and ambiguous IPv4 forms. Structurally malformed imports produce useful errors.
- Packet inspection preserves the incoming Ethernet fields at delivery and ACK receipt. Transport-only creation events clearly show that framing is pending. Control packets no longer show application chunk numbers.
- Unroutable IP packets and expired ARP pending packets count toward drops. Pending-request timeouts are tied to their request group.
- Replay without a run remains idle. Unavailable playback controls are disabled. Rendering uses only the revealed trace prefix, including when stepping among events with the same timestamp.
- Invalid Send submissions preserve the previous valid run/configuration. Interventions validate before replacing state and clear outdated pinned event objects.
- Timeline updates preserve keyboard focus. Device inspection reopens the notebook; Escape collapses an expanded notebook. Dialogs pause playback. Fault controls display the current applied delay.
- Clearing saved progress exits the active lesson to prevent completion from being immediately re-awarded by an old trace. Imported experiments are labeled separately, and preset scenarios restore the canonical lab.
- Returning through the browser back/forward cache resumes the animation loop without destroying the scene's observer/listener.

## Verification

- 46 passing Vitest tests, including regression tests and a 32-configuration TCP/UDP seed/loss matrix.
- TypeScript check and Vite production build.
- Existing full-journey browser suite: send, inspect, timed loss, recover, replay, UDP failure, rerouting, import/export, and reduced motion.
- Extended browser audit: input rejection, endpoint errors, reset, keyboard focus, notebook visibility, settings persistence, modal pause, clearing progress, live fault state, and all six lessons.
- No document overflow at viewport widths of 320, 390, 768, 1024, and 1440 pixels.
- Browser console/page errors are recorded in the verification JSON files. Screenshots are kept under `docs/screenshots/`.

This verifies the documented educational scope. It does not claim complete TCP/IP emulation or prove that no undiscovered defects remain.
