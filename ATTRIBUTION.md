# Attribution and modification record

**Original work:** NO PEEKING! by Nitheesh Chandra, © 2026.

**Source:** https://github.com/nitheesh-me/no-peeking

**Reviewed upstream revision:** `006abf1cf7ef374af326b40581f8503a105c8804`.

**License:** Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International. The full upstream legal text is retained in `LICENSE`. PacketVerse modifications are made available under the same license. This requires attribution, noncommercial use, and share alike for adaptations. No endorsement by the upstream creator is implied.

## PacketVerse modifications

- Replaced the application entry point, metadata, page structure, styles, simulation contracts, playback behavior, and all educational content with a networking application.
- Added a new deterministic network engine, explicit interfaces and links, Ethernet/ARP/IP forwarding, a documented TCP subset, UDP application behavior, faults, metrics, validation, persistence, scenarios, and protocol tests.
- Created new procedural computers, switches, routers, cables, packet parcels, floor, vegetation, and guide bot in `src/art/network/world.ts`. The reference’s illustrated paper palette, rounded outlines, gradient contact shadows, cached scenery, and trace-driven interaction informed this implementation. No upstream quantum-specific contracts or algorithms run in PacketVerse.
- Added the Network Notebook, lesson trail, accessibility alternatives, responsive controls, and scenario JSON import/export.
- Updated Vite’s lockfile resolution within the original declared version range to address reported upstream advisories. Dependency names remain TypeScript, Vite, and Vitest.
- Preserved upstream source, original README, and archived quantum tests under `reference/`, excluded from the runtime dependency graph and current checks. These archived tests refer to the original repository paths and are historical reference, not runnable PacketVerse tests.
- The original display fonts and artwork are kept in `reference/` for provenance and are not loaded or shipped by PacketVerse. Quicksand alone is used by the app.

## Fonts and third-party dependencies

`public/fonts/Quicksand.woff2` is retained from the original repository and distributed under SIL Open Font License 1.1. Its license is included as `public/fonts/OFL-Quicksand.txt`, sourced from the Google Fonts Quicksand directory. Separate original fonts in `reference/original-fonts/` retain their original terms and are not used by PacketVerse; see the upstream README and LICENSE notes. npm packages retain their own licenses.

Attribution and a clear simulation-scope explanation are also available in the running application’s **Attribution & scope** dialog.
