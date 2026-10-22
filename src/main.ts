import "./styles/packetverse.css";
import { livePlayByPlay } from "./ui/live-play-by-play";
import { mountOsiFormats } from "./ui/osi-formats";
import { soundEffects } from "./audio/sound-effects";
import { mountOsiConnected } from "./ui/osi-connected";
import { mountOsiJourney } from "./ui/osi-journey";
import { networkUnits } from "./learning/network-course";
import { networkClassroom, mountNetworkVisuals } from "./ui/network-classroom";
import { laboratory } from "./network/topology";
import {
  simulate,
  validateConfig,
  exportScenario,
  importScenario,
} from "./network/simulation";
import {
  defaults,
  type Config,
  type Event,
  type Topology,
  type Result,
} from "./network/types";
import { NetworkPlayback } from "./engine/network-playback";
import { NetworkWorld } from "./art/network/world";
import { notebook, notebookPlainGuide, tabs, escape as esc } from "./ui/network-notebook";
import { scenarios, chapters, challengePassed } from "./scenarios/network";
const $ = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T;
const read = (key: string, fallback: unknown) => {
  try {
    return (
      JSON.parse(localStorage.getItem(`packetverse.v1.${key}`) ?? "null") ??
      fallback
    );
  } catch {
    return fallback;
  }
};
const save = (key: string, value: unknown) => {
  try {
    localStorage.setItem(`packetverse.v1.${key}`, JSON.stringify(value));
  } catch {
    /* Private mode still supports the lab. */
  }
};
let config: Config = structuredClone(defaults),
  topology: Topology = laboratory(),
  scenario = "delivery",
  tab = "Journey",
  selectedDevice: string | undefined,
  selectedEvent: Event | undefined,
  chapter: number | null = null;
let completed: number[] = read("progress", []);
if (!Array.isArray(completed)) completed = [];
completed = [
  ...new Set(completed.filter((n) => Number.isInteger(n) && n >= 0 && n < 6)),
];
let reduced = !!read(
    "reduced",
    matchMedia("(prefers-reduced-motion: reduce)").matches,
  ),
  muted = !!read("muted", false),
  notebookOpen = true;
soundEffects.setEnabled(!muted);
soundEffects.setVolume(Number(read("sound-volume", .5)));
const detachSounds = soundEffects.bindInterface();
const viewed = new Set<string>(),
  playback = new NetworkPlayback();
const savedPace = String(read("playback-pace", "study"));
const playbackPace = ["study","0.02","0.05","0.1","0.25","0.5","1","2","4"].includes(savedPace) ? savedPace : "study";
playback.readAlong = playbackPace === "study";
if (!playback.readAlong) playback.speed=Number(playbackPace);
let lastIndex = -1,
  lastUI = 0;
const cube =
  '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="m7 13 13-7 13 7-13 8ZM7 13v15l13 7 13-7V13M20 21v14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><path d="m13 10 13 7" stroke="currentColor" stroke-width="2"/></svg>';
$("app").innerHTML =
  `<header class="topbar"><button id="brand" class="brand" aria-label="PacketVerse home"><span class="brand-icon">${cube}</span><span>Packet<span class="brand-light">Verse</span><small>A LITTLE WORLD OF NETWORKS</small></span></button><nav aria-label="Main navigation"><button id="learn-nav">CN classroom <span class="nav-count">5</span></button><button id="lab-nav" class="active">Network lab</button><button id="osi-nav">OSI explorer <span class="nav-count">7</span></button><button id="notebook-nav">Notebook <span>↗</span></button></nav><div class="header-actions"><span class="local-badge"><i></i> All local. All yours.</span><button id="sound" class="icon-button" data-sound-control aria-label="Unmute sound" title="Toggle sound">♪</button><button id="settings" class="icon-button" aria-label="Settings" title="Settings">⚙</button><button id="help" class="icon-button" aria-label="Help" title="Help">?</button></div></header>
<nav id="module-menu" class="module-menu" aria-label="Learning modules"><div class="module-menu-title"><strong>Your learning space</strong><span>Learn the course · try the lab · explore the layers</span></div><div class="module-cards"><a href="#network-lab" data-module="lab" style="--module-color:#45867b;--module-pale:#dcefe6"><b>▣</b><span>Network lab<small>Experiment · notebook · 6 guided missions</small></span></a><a href="#cn-unit-1" data-module="classroom" style="--module-color:#4889bc;--module-pale:#e0edfb"><b>▤</b><span>CN classroom<small>R25 · Units 1–5 · visual syllabus</small></span></a><a href="#osi-layer-1" data-module="osi" style="--module-color:#9461b7;--module-pale:#eee1fa"><b>7</b><span>OSI explorer<small>7 worlds · whole journey · format guide</small></span></a></div></nav>
<main id="lab"><section class="page-heading"><div><div class="eyebrow"><span></span> THE NETWORK LAB <span class="slash">/</span> LEARN BY DOING</div><h1>Small packets. <em>Big journeys.</em></h1><p>Send a little hello. Follow it across the network. Make a discovery.</p></div><div class="heading-actions"><button id="network-classroom" class="trail-button java-classroom-button"><span class="trail-symbol">↔</span><span>Network classroom<small>VNRVJIET · R25 · CYS · THEORY</small></span><span>↗</span></button><button id="trail" class="trail-button"><span class="trail-symbol">✦</span><span>Guided lab missions<small id="progress-label">0 of 6 discoveries</small></span><span>↗</span></button></div></section>
<section class="composer" aria-label="Message configuration"><div class="experiment"><span class="tiny-label">YOUR EXPERIMENT</span><select id="scenario" aria-label="Scenario">${scenarios.map((s) => `<option value="${s.id}">${s.name}</option>`).join("")}</select></div><div class="endpoints"><label>FROM<select id="sender" aria-label="Sender"></select></label><span class="journey-arrow">→</span><label>TO<select id="receiver" aria-label="Receiver"></select></label></div><label class="message-input"><span>YOUR MESSAGE</span><input id="message" value="Hello, network!" maxlength="512" aria-label="Your message" placeholder="A little hello…"><small id="byte-count">14 bytes</small></label><fieldset class="protocol"><legend>PROTOCOL <span title="TCP retries missing data. UDP sends without an automatic delivery guarantee.">ⓘ</span></legend><label><input type="radio" name="protocol" value="TCP" checked><span>TCP</span></label><label><input type="radio" name="protocol" value="UDP"><span>UDP</span></label></fieldset><button id="send" class="primary">Send message <span>↗</span></button></section>
<details class="lab-plain-guide"><summary>New here? See the journey in everyday words</summary><div><span><b>1 · Write a hello</b>Your words become bytes: small pieces a computer can store.</span><span><b>2 · Send small parcels</b>Packets carry those bytes. Switches guide local delivery; routers join different networks.</span><span><b>3 · Follow the receipts</b>TCP uses ACKs (“received up to here”) and retries missing data. UDP does not automatically retry.</span><span><b>4 · Try a mission</b>Guided lab missions give you one small experiment at a time. The notebook explains what you see.</span></div></details>
<div id="notice" class="notice" role="status" aria-live="polite" hidden></div><section id="challenge" class="challenge" hidden></section>
<div class="workbench"><section class="lab-card"><div class="scene-heading"><div><span class="status-dot" id="status-dot"></span><strong id="scene-title">The first hello</strong><span class="scene-subtitle" id="scene-state">Ready when you are</span></div><div class="scene-tools"><span class="pill sandbox-pill">SANDBOX</span><span class="pan-hint">↔ Swipe map</span><button id="reset" class="text-button" title="Clear the current journey">↻ Reset</button></div></div><div class="canvas-container"><canvas id="world" aria-label="Illustrated network lab. Use the device and packet lists below to inspect objects with the keyboard." role="img"></canvas><div class="canvas-caption"><span class="mini-star">✦</span> A tiny internet. A real packet journey.</div><button id="legend-toggle" class="legend-button" aria-expanded="false">ⓘ Map key</button><div id="legend" class="legend" hidden><span><i class="blue"></i> TCP data · #</span><span><i class="purple"></i> UDP data · #</span><span><i class="mint"></i> ACK · ✓</span><span><i class="amber"></i> ARP · ? / retry</span><span><i class="red"></i> Loss · ×</span></div></div><section class="live-play-by-play" aria-label="Live packet explanation"><div class="live-reader-copy"><small id="live-hop-label">LIVE PLAY-BY-PLAY</small><div role="status" aria-live="polite"><strong id="live-hop-title">Ready for your first hello</strong><p id="live-hop-explanation">Write a message and press Send. Watch the map and read the explanation here.</p></div><div class="live-hop-progress" aria-hidden="true"><i id="live-hop-progress"></i></div></div><button id="live-hop-pause" class="text-button" disabled>Pause & read</button></section><div class="world-footer"><div class="device-list" id="device-list" aria-label="Inspect a device"></div><span class="route-mode">CENTRALIZED ROUTING <span title="Simplified Dijkstra, not a distributed protocol">ⓘ</span></span></div><div class="playback"><button id="play" class="play-button" aria-label="Play or pause">▶</button><button id="next" class="icon-button" aria-label="Next event" title="Next event">▸|</button><button id="replay" class="icon-button" aria-label="Replay journey" title="Replay">↶</button><div class="time-control"><div><span id="time-label">0.0 ms</span><span id="duration-label">SIMULATION TIME</span></div><input id="scrubber" type="range" min="0" max="1000" value="0" aria-label="Journey timeline"></div><select id="speed" aria-label="Playback speed"><option value="study">Read-along · 3s/hop</option><option value="0.02">0.02× · very slow</option><option value="0.05">0.05× · slow</option><option value="0.1">0.1×</option><option value="0.25">0.25×</option><option value="0.5">0.5×</option><option value="1">1×</option><option value="2">2×</option><option value="4">4×</option></select><span class="playback-divider"></span><button id="drop-data" class="fault-button">✂ Drop next data</button><button id="faults" class="icon-button" aria-label="More network faults" title="Network faults">···</button></div></section>
<aside class="notebook" id="notebook-panel"><div class="notebook-top"><span class="book-symbol">▤</span><div><strong>Network notebook</strong><small>A CLOSER LOOK AT THE JOURNEY</small></div><button id="expand-notebook" class="icon-button" aria-label="Expand notebook">⤢</button></div><div class="notebook-tabs"><button id="journey-tab" class="selected">Journey</button><button id="fields-tab">Fields</button><select id="notebook-page" aria-label="Notebook page">${tabs.map((t) => `<option>${t}</option>`).join("")}</select></div><div id="selection-label" class="selection-label" hidden>Selection pinned <button id="unpin" class="text-button">Follow live ↗</button></div><div id="notebook-content" class="notebook-content"></div><div class="notebook-bottom">✎ THERE’S A STORY IN EVERY PACKET.</div></aside></div>
<section class="journey-log"><div class="log-header"><div><span class="tiny-label">THE JOURNEY SO FAR</span><h2>Every hop has a story.</h2></div><div class="log-tabs"><button id="events-tab" class="selected">Event timeline</button><button id="packets-tab">Packet list</button></div><span id="event-count" class="pill">0 events</span></div><div id="event-list" class="event-list"><div class="empty-timeline"><span>↗</span><div><strong>Your story starts with a message.</strong><p>Send one above, and the network will take it from here.</p></div><span class="timeline-doodle">· · · →</span></div></div></section>
<section class="delivery-strip" id="delivery-strip" hidden><div><span class="tiny-label">AT THE OTHER END</span><p id="received-message"></p></div><span id="delivery-status" class="pill"></span></section>
<footer class="footer"><span>Made for curious minds. <span class="footer-star">✦</span> No packets leave your browser.</span><div><button id="home-link">Welcome</button><button id="credits">Attribution & scope</button><span>PACKETVERSE · v1.0</span></div></footer></main>
<main id="osi-studio" hidden></main>
<dialog id="modal"><div class="modal-header"><span class="tiny-label" id="modal-kicker">PACKETVERSE</span><button id="close-modal" class="icon-button" aria-label="Close dialog">×</button></div><div id="modal-content"></div></dialog><input id="import-file" type="file" accept="application/json,.json" hidden>`;
const world = new NetworkWorld($<HTMLCanvasElement>("world"), (id, e) => {
  soundEffects.play("inspect");
  selectedDevice = e ? undefined : id;
  selectedEvent = e;
  tab = e ? "Packet Fields" : "Journey";
  revealNotebook();
  refreshNotebook();
});
function notice(message: string, error = false) {
  if (error) soundEffects.play("error");
  $("notice").hidden = false;
  $("notice").textContent = message;
  $("notice").classList.toggle("error", error);
}
function hosts() {
  for (const id of ["sender", "receiver"]) {
    $(id).innerHTML = topology.devices
      .filter((d) => d.kind === "host")
      .map((d) => `<option value="${esc(d.id)}">${esc(d.name)}</option>`)
      .join("");
    $<HTMLSelectElement>(id).value =
      config[id === "sender" ? "sender" : "receiver"];
  }
  $("device-list").innerHTML = topology.devices
    .map(
      (d) =>
        `<button data-device="${esc(d.id)}" title="Inspect ${esc(d.name)}">${d.kind === "host" ? "▣" : d.kind === "router" ? "↔" : "▥"} ${esc(d.name.replace("Computer ", "PC ").replace("Switch ", "SW ").replace("Router ", "R"))}</button>`,
    )
    .join("");
}
function syncForm() {
  $<HTMLInputElement>("message").value = config.message;
  $<HTMLSelectElement>("sender").value = config.sender;
  $<HTMLSelectElement>("receiver").value = config.receiver;
  document
    .querySelectorAll<HTMLInputElement>('input[name="protocol"]')
    .forEach((el) => (el.checked = el.value === config.protocol));
  updateBytes();
}
function formConfig(): Config {
  return {
    ...config,
    message: $<HTMLInputElement>("message").value,
    sender: $<HTMLSelectElement>("sender").value,
    receiver: $<HTMLSelectElement>("receiver").value,
    protocol: document.querySelector<HTMLInputElement>(
      'input[name="protocol"]:checked',
    )!.value as Config["protocol"],
  };
}
function updateBytes() {
  $("byte-count").textContent =
    `${new TextEncoder().encode($<HTMLInputElement>("message").value).length} bytes`;
}
let visibleCache: Event[] = [],
  cacheResult: Result | null = null,
  cacheIndex = -1;
function visibleEvents() {
  if (cacheResult !== playback.result || cacheIndex !== playback.index) {
    cacheResult = playback.result;
    cacheIndex = playback.index;
    visibleCache = playback.result?.events.slice(0, playback.index + 1) ?? [];
  }
  return visibleCache;
}
function revealNotebook() {
  notebookOpen = true;
  $("notebook-panel").hidden = false;
  document.querySelector(".workbench")!.classList.remove("notebook-hidden");
  $("notebook-nav").setAttribute("aria-expanded", "true");
}

function refreshNotebook() {
  const plainGuideOpen = $("notebook-content").querySelector<HTMLDetailsElement>(".notebook-plain-guide")?.open ?? false;
  const event = selectedEvent ?? playback.current;
  const device = topology.devices.find((d) => d.id === selectedDevice);
  $("notebook-content").innerHTML = notebook(
    tab,
    event,
    config,
    topology,
    device,
    selectedEvent && playback.result
      ? playback.result.events.slice(
          0,
          playback.result.events.indexOf(selectedEvent) + 1,
        )
      : visibleEvents(),
  ) + notebookPlainGuide(tab);
  $("notebook-content").querySelector<HTMLDetailsElement>(".notebook-plain-guide")!.open=plainGuideOpen;
  $<HTMLSelectElement>("notebook-page").value = tab;
  $("journey-tab").classList.toggle("selected", tab === "Journey");
  $("fields-tab").classList.toggle("selected", tab === "Packet Fields");
  $("selection-label").hidden = !selectedEvent && !selectedDevice;
  if (playback.current) viewed.add(tab);
  checkChallenge();
}
function setTab(t: string) {
  tab = t;
  save("notebook-page", t);
  refreshNotebook();
}
let logMode = "events",
  lastLogKey = "";
function refreshTimeline() {
  const visible = visibleEvents();
  $("event-count").textContent = `${visible.length} events`;
  if (!visible.length) return;
  // Do not replace a focused row while a keyboard user is inspecting the list.
  if ($("event-list").contains(document.activeElement)) {
    $("event-list")
      .querySelectorAll<HTMLElement>("[data-event]")
      .forEach((el) =>
        el.classList.toggle(
          "event-selected",
          el.dataset.event === (selectedEvent?.id ?? playback.current?.id),
        ),
      );
    return;
  }
  const renderKey = `${logMode}:${visible.length}:${selectedEvent?.id ?? playback.current?.id}`;
  if (renderKey === lastLogKey) return;
  lastLogKey = renderKey;
  const follow =
    $("event-list").scrollHeight -
      $("event-list").scrollTop -
      $("event-list").clientHeight <
    25;
  let list = visible.slice(-40);
  if (logMode === "packets") {
    const seen = new Set<string>();
    list = visible.filter((e) => {
      const id = e.frame?.packet?.id;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }
  const active = selectedEvent?.id ?? playback.current?.id;
  $("event-list").innerHTML = list
    .map(
      (e) =>
        `<button data-event="${e.id}" class="event-row ${e.kind} ${e.id === active ? "event-selected" : ""}"><span class="event-marker">${e.kind === "drop" ? "×" : e.kind === "complete" ? "✓" : e.kind === "fault" ? "✂" : e.kind === "arp" ? "?" : "↗"}</span><time>${e.time.toFixed(1)} <small>ms</small></time><strong>${esc(logMode === "packets" ? `${e.frame?.packet?.id} · ${e.frame?.packet?.type} · seq ${e.frame?.packet?.seq}` : e.title)}</strong><span>${esc(e.device ?? e.link ?? "network")}</span></button>`,
    )
    .join("");
  if (follow && !selectedEvent)
    $("event-list").scrollTop = $("event-list").scrollHeight;
}
function refresh() {
  const e = playback.current,
    m = e?.metrics;
  $("time-label").textContent = `${playback.time.toFixed(1)} ms`;
  $("duration-label").textContent = playback.result
    ? `/ ${playback.duration.toFixed(1)} ms`
    : "SIMULATION TIME";
  $<HTMLInputElement>("scrubber").value = String(
    playback.duration ? (playback.time / playback.duration) * 1000 : 0,
  );
  $("play").textContent = playback.playing ? "Ⅱ" : "▶";
  $("play").setAttribute("aria-label", playback.playing ? "Pause" : "Play");
  $("scene-state").textContent = e
    ? e.status === "Complete"
      ? "Delivered & acknowledged"
      : e.status === "Failed"
        ? "Journey ended · inspect the log"
        : e.title
    : "Ready when you are";
  $("scene-title").textContent =
    scenarios.find((s) => s.id === scenario)?.name ?? "Your experiment";
  $("status-dot").classList.toggle("live", playback.playing);
  $<HTMLButtonElement>("replay").disabled = !playback.result;
  $<HTMLButtonElement>("next").disabled =
    !playback.result || playback.index === playback.result.events.length - 1;
  $<HTMLInputElement>("scrubber").disabled = !playback.result;
  if (!selectedEvent) refreshNotebook();
  refreshTimeline();
  $("delivery-strip").hidden = !e;
  $("received-message").textContent =
    e?.status === "Complete"
      ? new TextDecoder().decode(new Uint8Array(e.received))
      : m?.bytes
        ? `${m.bytes} unique application bytes received · waiting for completion`
        : "Waiting for a little hello…";
  $("delivery-status").textContent = e?.status ?? "Ready";
  refreshLiveReader();
  checkChallenge();
}
function refreshLiveReader() {
  const current=livePlayByPlay(visibleEvents(),playback.time,config,topology);
  for(const [id,text] of [["live-hop-title",current.title],["live-hop-explanation",current.explanation],["live-hop-label",current.label]]) {
    if($(id).textContent!==text) $(id).textContent=text;
  }
  $("live-hop-progress").style.width=`${current.progress*100}%`;
  $("live-hop-pause").textContent=playback.playing?"Pause & read":playback.result&&playback.time>=playback.duration?"Watch again":"Resume journey";
  $<HTMLButtonElement>("live-hop-pause").disabled=!playback.result;
}
function run() {
  try {
    const candidate = formConfig();
    const r = simulate(candidate, topology);
    config = candidate;
    playback.load(r);
    selectedEvent = undefined;
    selectedDevice = undefined;
    lastIndex = -1;
    $("notice").hidden = true;
    refresh();
    soundEffects.play("send");
    const liveBounds=$("live-hop-explanation").getBoundingClientRect();
    if(liveBounds.bottom>innerHeight-90) document.querySelector(".lab-card")?.scrollIntoView({block:"start",behavior:"instant"});
  } catch (e) {
    notice((e as Error).message, true);
  }
}
function reset() {
  playback.reset();
  selectedEvent = undefined;
  selectedDevice = undefined;
  lastIndex = -1;
  lastLogKey = "";
  $("event-list").innerHTML =
    '<div class="empty-timeline"><span>↗</span><div><strong>A fresh start.</strong><p>Your next discovery is one message away.</p></div></div>';
  $("notice").hidden = true;
  if (chapter !== null && $("challenge-status"))
    $("challenge-status").textContent = "In progress";
  refresh();
}
function changeScenario(id: string) {
  const s = scenarios.find((s) => s.id === id);
  if (!s) return;
  scenario = id;
  topology = laboratory();
  config = { ...structuredClone(defaults), ...structuredClone(s.config) };
  hosts();
  reset();
  syncForm();
  $<HTMLSelectElement>("scenario").value = id;
  notice(s.description);
}
function intervene(
  kind: "data" | "ack" | "link" | "delay",
  link?: string,
  value?: number,
) {
  if (playback.result && playback.time >= playback.duration) {
    notice("Replay or send a new message before introducing a fault.");
    return;
  }
  const time = playback.result ? playback.time : 0;
  const candidate = {
    ...config,
    faults: [
      ...config.faults,
      { time: playback.result ? time + 0.001 : 0, kind, link, value },
    ],
  };
  try {
    validateConfig(candidate, topology);
    if (!playback.result) {
      config = candidate;
      notice("Fault scheduled for the next run.");
      return;
    }
    const result = simulate(candidate, topology),
      playing = playback.playing;
    config = candidate;
    selectedEvent = undefined;
    selectedDevice = undefined;
    lastLogKey = "";
    playback.load(result);
    playback.seek(time);
    playback.playing = playing;
    notice(
      `Intervention scheduled at ${time.toFixed(1)} ms. Continue playback to observe it.`,
    );
    refresh();
  } catch (e) {
    notice((e as Error).message, true);
  }
}

function showOsiConnected() {
  closeModal();
  osiJourney?.destroy();
  playback.playing = false;
  $("lab").hidden = true;
  $("osi-studio").hidden = false;
  $("lab-nav").classList.remove("active");
  $("osi-nav").classList.remove("active");
  updateModuleNavigation("connected");
  soundEffects.play("layer");
  osiJourney = mountOsiConnected($("osi-studio"), {
    message: String(read("osi-message", "Hello, network!")),
    reduced: () => reduced,
    saveMessage: (message) => save("osi-message", message),
    navigate: (id) => { location.hash = `osi-layer-${id}`; },
    formats: showOsiFormats,
    close: () => { const id = Number(read("osi-layer", 1)); location.hash = `osi-layer-${id >= 1 && id <= 7 ? id : 1}`; },
  });
  window.scrollTo({ top: 0, behavior: "instant" });
  $("connected-title").focus({ preventScroll: true });
}
let osiJourney: ReturnType<typeof mountOsiJourney> | undefined;
function leaveOsiJourney() {
  osiJourney?.destroy();
  osiJourney = undefined;
  $("osi-studio").hidden = true;
  soundEffects.setLayer(1);
  $("lab").hidden = false;
  $("lab-nav").classList.add("active");
  $("osi-nav").classList.remove("active");
  updateModuleNavigation("lab");
}
function showOsiJourney(layer: number) {
  closeModal();
  osiJourney?.destroy();
  playback.playing = false;
  $("lab").hidden = true;
  $("lab-nav").classList.remove("active");
  $("osi-nav").classList.add("active");
  $("osi-studio").hidden = false;
  soundEffects.setLayer(layer);
  soundEffects.play("layer", layer);
  updateModuleNavigation("osi");
  save("osi-layer", layer);
  osiJourney = mountOsiJourney($("osi-studio"), {
    layer,
    message: String(read("osi-message", "Hello, network!")),
    reduced: () => reduced,
    navigate: (id) => { if (id >= 1 && id <= 7) location.hash = `osi-layer-${id}`; },
    close: () => { location.hash = "network-lab"; },
    reference: (unit) => showNetworkClassroom(unit),
    formats: showOsiFormats,
    saveMessage: (message) => save("osi-message", message),
  });
  window.scrollTo({ top: 0, behavior: "instant" });
  $("osi-title").focus({ preventScroll: true });
  const active = $("osi-studio").querySelector<HTMLElement>('.osi-layer-nav [aria-current]');
  const rail = $("osi-studio").querySelector<HTMLElement>('.osi-layer-nav');
  if (active && rail) rail.scrollLeft = Math.max(0, active.offsetLeft - rail.offsetLeft - rail.clientWidth / 2 + active.clientWidth / 2);
}
let formatReference: ReturnType<typeof mountOsiFormats> | undefined;
function showOsiFormats() {
  const layer = Number($("osi-studio").dataset.currentLayer) || 1;
  showModal('<div id="shared-formats-host"></div>', "OSI EXPLORER · DATA FORMATS");
  formatReference = mountOsiFormats($("shared-formats-host"), {
    message: String(read("osi-message", "Hello, network!")), layer,
    onMessage: (message) => {
      save("osi-message", message);
      const input = $("osi-studio").querySelector<HTMLInputElement>('#osi-message, #connected-message');
      if(input) { input.value = message; input.dispatchEvent(new Event("input", { bubbles: true })); }
      formatReference?.update(message, Number($("osi-studio").dataset.currentLayer) || layer);
    },
  });
  $("formats-title").focus({ preventScroll: true });
}
let classroomVisuals: ReturnType<typeof mountNetworkVisuals> | undefined;
function showModal(content: string, kicker = "PACKETVERSE") {
  formatReference?.destroy();
  formatReference=undefined;
  classroomVisuals?.destroy();
  classroomVisuals = undefined;
  playback.playing = false;
  refresh();
  $("modal").classList.toggle(
    "java-dialog",
    kicker === "NETWORK CLASSROOM · THEORY ONLY",
  );
  $("modal").classList.toggle("formats-dialog", kicker === "OSI EXPLORER · DATA FORMATS");
  $("modal-kicker").textContent = kicker;
  $("modal-content").innerHTML = content;
  if (!$<HTMLDialogElement>("modal").open)
    $<HTMLDialogElement>("modal").showModal();
}
function closeModal() {
  formatReference?.destroy();
  formatReference=undefined;
  classroomVisuals?.destroy();
  classroomVisuals = undefined;
  $<HTMLDialogElement>("modal").close();
}
function showNetworkClassroom(unitID?: number, focusHeading = false) {
  soundEffects.play("open");
  updateModuleNavigation("classroom");
  const saved = read("cn-unit", 1);
  const unit =
    networkUnits.find((u) => u.id === (unitID ?? saved)) ?? networkUnits[0];
  save("cn-unit", unit.id);
  if (/^#(?:cn|cn-reference|java)-unit-/.test(location.hash)) history.replaceState(null,"",`#cn-unit-${unit.id}`);
  showModal(networkClassroom(unit), "NETWORK CLASSROOM · THEORY ONLY");
  $("modal").scrollTop = 0;
  if (focusHeading) $("cn-unit-title").focus({ preventScroll: true });
  $("modal-content")
    .querySelectorAll<HTMLElement>("[data-cn-unit]")
    .forEach(
      (button) =>
        (button.onclick = () =>
          showNetworkClassroom(Number(button.dataset.cnUnit), true)),
    );
  const osiLink = document.getElementById("cn-open-osi");
  if (osiLink) osiLink.onclick = () => navigateModule("#osi-layer-1");
  $("cn-prev").onclick = () => showNetworkClassroom(unit.id - 1, true);
  $("cn-next").onclick = () => showNetworkClassroom(unit.id + 1, true);
  classroomVisuals = mountNetworkVisuals($("modal-content"), unit);
  $("cn-download").textContent = "↓ Full notes (PDF)";
  $("cn-download").onclick = () => {
    const a=document.createElement("a");
    a.href=`${import.meta.env.BASE_URL}downloads/PacketVerse-CN-R25-Units-1-to-5.pdf`;
    a.download="PacketVerse-CN-R25-Units-1-to-5.pdf";
    a.click();
  };
  $("cn-scene").onclick = () => {
    leaveOsiJourney();
    history.replaceState(null, "", "#network-lab");
    chapter = null;
    $("challenge").hidden = true;
    changeScenario(unit.scene.scenario);
    revealNotebook();
    selectedEvent = undefined;
    selectedDevice = undefined;
    setTab(unit.scene.page);
    closeModal();
    notice(`Computer Networks Unit ${unit.id}: ${unit.scene.instruction}`);
  };
}
function showHome() {
  showModal(
    `<div class="welcome"><span class="welcome-stamp">✦ A SMALL WORLD. A BIG DISCOVERY.</span><div class="welcome-cube">${cube}</div><h2>The internet is a journey.<br><em>Let’s follow a packet.</em></h2><p>Turn your words into little parcels. Meet the devices that move them. Break things, ask why, and watch the network find its way.</p><div class="welcome-actions"><button id="start-learning" class="primary">Start learning ↗</button><button id="open-sandbox" class="secondary">Open sandbox →</button></div><small>6 guided discoveries · TCP & UDP · a safe place to experiment</small></div>`,
    "WELCOME TO PACKETVERSE",
  );
  $("start-learning").onclick = () => navigateModule("#cn-unit-1");
  $("open-sandbox").onclick = () => {
    leaveOsiJourney();
    history.replaceState(null, "", "#network-lab");
    save("welcomed", true);
    closeModal();
  };
}
function showChapters() {
  leaveOsiJourney();
  if (location.hash !== "#learning-trail") history.replaceState(null,"","#learning-trail");
  updateModuleNavigation("trail");
  showModal(
    `<h2>Guided lab missions<span class="green-dot">.</span></h2><p class="modal-intro">Six small experiments inside the network lab. Pick a mission, send a message, and follow the notebook to make a discovery.</p><div class="chapter-grid">${chapters.map((ch, i) => `<button class="chapter-card ${completed.includes(i) ? "done" : ""}" data-chapter="${i}"><span class="chapter-number">${completed.includes(i) ? "✓" : ch.icon}</span><span><small>${esc(ch.subtitle)}</small><strong>${esc(ch.title)}</strong><p>${esc(ch.objective)}</p></span><b>↗</b></button>`).join("")}</div>`,
    "NETWORK LAB · GUIDED MISSIONS",
  );
  $("modal-content")
    .querySelectorAll<HTMLElement>("[data-chapter]")
    .forEach(
      (el) =>
        (el.onclick = () => {
          leaveOsiJourney();
          history.replaceState(null, "", "#network-lab");
          chapter = Number(el.dataset.chapter);
          viewed.clear();
          changeScenario(chapters[chapter].scenario);
          $("challenge").hidden = false;
          $("challenge").innerHTML =
            `<span class="chapter-chip">${chapters[chapter].icon}</span><div><strong>${esc(chapters[chapter].title)}</strong><span>${esc(chapters[chapter].objective)}</span></div><span id="challenge-status" class="pill">In progress</span><button id="leave-chapter" class="text-button">Leave lesson ×</button>`;
          $("leave-chapter").onclick = () => {
            chapter = null;
            $("challenge").hidden = true;
          };
          save("welcomed", true);
          closeModal();
        }),
    );
}
function checkChallenge() {
  if (chapter === null || !playback.result || playback.time < playback.duration)
    return;
  if (challengePassed(chapter, playback.result, viewed)) {
    if (!completed.includes(chapter)) {
      completed.push(chapter);
      save("progress", completed);
      soundEffects.play("success");
    }
    if ($("challenge-status"))
      $("challenge-status").textContent = "Discovery made ✓";
    $("progress-label").textContent = `${completed.length} of 6 discoveries`;
  }
}
function settings() {
  showModal(
    `<h2>A lab that feels like yours.</h2><p class="modal-intro">Network settings apply to the next message. Fault buttons can also schedule changes during playback.</p><form id="settings-form"><div class="settings-grid"><label>Random seed<input name="seed" type="number" min="0" max="4294967295" step="1" value="${config.seed}" required></label><label>Loss per transmitted IP frame (%)<input name="loss" type="number" min="0" max="100" step="0.1" value="${config.loss * 100}" required></label><label>Initial IP TTL<input name="ttl" type="number" min="1" max="64" step="1" value="${config.ttl}" required></label><label>Teaching MSS (bytes)<input name="mss" type="number" min="1" max="64" step="1" value="${config.mss}" required></label><label>TCP timeout (ms)<input name="timeout" type="number" min="100" max="30000" step="1" value="${config.timeout}" required></label><label>Retry limit<input name="retries" type="number" min="0" max="8" step="1" value="${config.retries}" required></label></div><label class="check-label"><input name="reorder" type="checkbox" ${config.reorder ? "checked" : ""}> Delay the first application segment (out-of-order demo)</label><label class="check-label"><input name="reduced" type="checkbox" ${reduced ? "checked" : ""}> Reduce motion</label><button class="primary" type="submit">Save settings</button></form><section class="sound-settings" aria-label="Sound effects"><div><h3>Sounds for the journey.</h3><p>Packet movement, layer changes, discoveries and faults have gentle sound cues. Typing and everyday clicks stay quiet.</p></div><label class="check-label"><input id="sound-enabled" data-sound-control type="checkbox" ${!muted ? "checked" : ""}> Sound effects on</label><label for="sound-volume">Effects volume <output id="sound-volume-value">${Math.round(Number(read("sound-volume",.5))*100)}%</output></label><input id="sound-volume" type="range" min="0" max="100" step="1" value="${Math.round(Number(read("sound-volume",.5))*100)}" aria-label="Sound effects volume"><small>Starts after your first interaction. Your choice is remembered.</small></section><div class="settings-divider"></div><h3>Keep your experiment</h3><div class="button-row"><button id="export" class="secondary">Export scenario ↓</button><button id="import" class="secondary">Import JSON ↑</button><button id="clear" class="text-button danger">Clear saved data</button></div><p class="note">Versioned JSON includes devices, addressed interfaces, link settings, faults, and message configuration. Learning progress stays in this browser.</p>`,
    "SETTINGS & SCENARIOS",
  );
  $<HTMLInputElement>("sound-enabled").onchange = (event) => {
    muted = !(event.target as HTMLInputElement).checked;
    save("muted", muted);soundEffects.setEnabled(!muted);syncSoundControls();
    if(!muted){soundEffects.unlock();soundEffects.play("open");}
  };
  $<HTMLInputElement>("sound-volume").oninput = (event) => {
    const volume = Number((event.target as HTMLInputElement).value) / 100;
    save("sound-volume",volume);soundEffects.setVolume(volume);
    $("sound-volume-value").textContent=`${Math.round(volume*100)}%`;syncSoundControls();
  };
  $("sound-volume").onchange = () => { soundEffects.unlock();soundEffects.play("inspect"); };
  $("settings-form").onsubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    const candidate = { ...config };
    for (const key of ["seed", "ttl", "mss", "timeout", "retries"] as const)
      candidate[key] = Number(data.get(key));
    candidate.loss = Number(data.get("loss")) / 100;
    candidate.reorder = data.has("reorder");
    try {
      validateConfig(candidate, topology);
    } catch (error) {
      closeModal();
      notice((error as Error).message, true);
      return;
    }
    config = candidate;
    reduced = data.has("reduced");
    save("reduced", reduced);
    save("network-preferences", {
      seed: config.seed,
      loss: config.loss,
      ttl: config.ttl,
      mss: config.mss,
      timeout: config.timeout,
      retries: config.retries,
      reorder: config.reorder,
    });
    document.body.classList.toggle("reduced-motion", reduced);
    reset();
    closeModal();
    notice("Settings saved. Send a message to run the updated experiment.");
  };
  $("export").onclick = () => {
    const blob = new Blob([exportScenario(formConfig(), topology)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "packetverse-scenario.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  $("import").onclick = () => $("import-file").click();
  $("clear").onclick = () => {
    try {
      for (const k of Object.keys(localStorage))
        if (k.startsWith("packetverse.v1.")) localStorage.removeItem(k);
    } catch {
      /* Storage can be unavailable in private mode. */
    }
    completed = [];
    chapter = null;
    viewed.clear();
    $("challenge").hidden = true;
    $("progress-label").textContent = "0 of 6 discoveries";
    notice("PacketVerse saved preferences and learning progress cleared.");
    closeModal();
  };
}
function faults() {
  showModal(
    `<h2>A little trouble in the network.</h2><p>Interventions are recorded at the current simulation time. Link changes trigger simplified centralized route recomputation.</p><div class="button-row"><button id="fault-data" class="secondary">✂ Drop next data frame</button><button id="fault-ack" class="secondary">× Drop next ACK frame</button></div><h3>Links & propagation delay</h3><div class="fault-links">${topology.links
      .map((l) => {
        const off =
          visibleEvents().filter(
            (e) =>
              e.kind === "fault" &&
              e.link === l.id &&
              e.title.includes("toggled"),
          ).length %
            2 ===
          1;
        return `<div><span><strong>${l.id}</strong> ${esc(l.a)} ↔ ${esc(l.b)}</span><button data-link="${l.id}" class="secondary">${(l.up && !off) || (!l.up && off) ? "Disable" : "Enable"}</button><label>Delay <input aria-label="${l.id} delay milliseconds" id="delay-${l.id}" type="number" min="0" max="2000" value="${
          visibleEvents()
            .filter((e) => e.link === l.id && e.linkState)
            .at(-1)?.linkState?.delay ?? l.delay
        }"> ms</label><button data-delay="${l.id}" class="text-button">Apply</button></div>`;
      })
      .join(
        "",
      )}</div><p class="note">A disabled link can drop a frame already in flight. One-shot frame loss applies to the next eligible link transmission. Random loss is configured in Settings.</p>`,
    "FAULT INJECTION",
  );
  $("fault-data").onclick = () => {
    intervene("data");
    closeModal();
  };
  $("fault-ack").onclick = () => {
    intervene("ack");
    closeModal();
  };
  $("modal-content")
    .querySelectorAll<HTMLElement>("[data-link]")
    .forEach(
      (el) =>
        (el.onclick = () => {
          intervene("link", el.dataset.link);
          closeModal();
        }),
    );
  $("modal-content")
    .querySelectorAll<HTMLElement>("[data-delay]")
    .forEach(
      (el) =>
        (el.onclick = () => {
          const value = Number(
            $<HTMLInputElement>(`delay-${el.dataset.delay}`).value,
          );
          if (!Number.isFinite(value) || value < 0 || value > 2000) {
            notice("Delay must be 0–2000 ms.", true);
            return;
          }
          intervene("delay", el.dataset.delay, value);
          closeModal();
        }),
    );
}
function credits() {
  showModal(
    `<h2>Built on a little curiosity.</h2><p>PacketVerse is a modified adaptation of <a href="https://github.com/nitheesh-me/no-peeking" target="_blank" rel="noreferrer">NO PEEKING! by Nitheesh Chandra</a>. Its procedural Canvas 2D approach, paper palette, outlined illustrations, and trace-driven interaction informed this network laboratory.</p><p>Adapted material and PacketVerse modifications are shared under <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noreferrer">CC BY-NC-SA 4.0</a>: attribution, noncommercial use, and share alike. Quicksand is distributed under its separate SIL Open Font License.</p><h3>A teaching model, with clear edges.</h3><p>Modeled: Ethernet forwarding, ARP exchange, longest-prefix IPv4 routing, TTL, FIFO serialization, TCP setup, byte sequences, cumulative ACKs, buffering, timeouts and retries; UDP application datagrams.</p><p>Routing is a simplified centralized Dijkstra computation, not OSPF or another distributed protocol. TCP omits congestion control, full flow control, teardown, checksums and RFC completeness. ARP requests have a teaching timeout. UDP message segmentation and indices are application behavior. No ICMP, NAT, fragmentation, DNS, or real network traffic.</p><p>Ethernet serialization includes header, FCS, and minimum padding; preamble and inter-frame gap are omitted. Imported topologies must be loop-free at layer 2. Packets are limited to 512 application bytes per experiment. Coordinates use the lab’s illustrated workspace.</p><div class="note">All times and metrics are calculated from this simulation. Nothing is measured on the real internet.</div>`,
    "ATTRIBUTION & SIMULATION SCOPE",
  );
}
function help() {
  showModal(
    `<h2>Curiosity is the only prerequisite.</h2><ol class="help-steps"><li><b>Write a little hello.</b> Choose sender, receiver, and TCP or UDP, then send.</li><li><b>Follow the parcels.</b> Blue is TCP, purple is UDP, and mint marks acknowledgements. The label tells you what a parcel carries.</li><li><b>Look inside.</b> Click a device or packet. Use the notebook’s pages for headers, ARP, MAC, routes, and metrics.</li><li><b>Try a little trouble.</b> Drop a frame or disable a cable. TCP can retry; UDP makes no delivery promise.</li><li><b>Take your time.</b> Pause, step one event, scrub the timeline, or replay the same trace. Playback speed never changes the network outcome.</li></ol><p class="note">Keyboard: Tab reaches every control. Device buttons and the packet list provide alternatives to clicking the canvas. Space toggles playback when you are outside a form or dialog. Escape closes dialogs. Event selection stays pinned until “Follow live”.</p>`,
    "A FIELD GUIDE",
  );
}
function syncSoundControls() {
  $("sound").textContent = muted ? "♪" : "♫";
  $("sound").setAttribute("aria-label", muted ? "Unmute sound" : "Mute sound");
  $("sound").setAttribute("aria-pressed", String(!muted));
  const volume = Number(read("sound-volume", .5));
  $("sound").title = muted ? "Sound off · click to enable" : `Sound on · ${Math.round(volume * 100)}% · click to mute`;
  $("sound").classList.toggle("sound-enabled", !muted);
  const checkbox = document.getElementById("sound-enabled") as HTMLInputElement | null;
  if(checkbox) checkbox.checked = !muted;
}
$("send").onclick = run;
$("message").oninput = updateBytes;
$("message").onkeydown = (e) => {
  if (e.key === "Enter") run();
};
$("reset").onclick = reset;
$("play").onclick = () => {
  if (!playback.result) {
    run();
    return;
  }
  if (playback.time >= playback.duration) playback.replay();
  else playback.playing = !playback.playing;
  refresh();
};
$("next").onclick = () => {
  playback.next();
  refresh();
};
$("replay").onclick = () => {
  playback.replay();
  selectedEvent = undefined;
  selectedDevice = undefined;
  refresh();
};
$("scrubber").oninput = () => {
  playback.playing = false;
  playback.seek(
    (Number($<HTMLInputElement>("scrubber").value) / 1000) * playback.duration,
  );
  refresh();
};
$<HTMLSelectElement>("speed").value=playbackPace;
$("speed").onchange = () => {
  const pace=$<HTMLSelectElement>("speed").value;
  playback.readAlong=pace==="study";
  if(!playback.readAlong)playback.speed=Number(pace);
  save("playback-pace",pace);
};
$("live-hop-pause").onclick = () => $("play").click();
$("drop-data").onclick = () => intervene("data");
$("faults").onclick = faults;
$("scenario").onchange = () => {
  chapter = null;
  $("challenge").hidden = true;
  changeScenario($<HTMLSelectElement>("scenario").value);
};
$("journey-tab").onclick = () => setTab("Journey");
$("fields-tab").onclick = () => setTab("Packet Fields");
$("notebook-page").onchange = () =>
  setTab($<HTMLSelectElement>("notebook-page").value);
$("unpin").onclick = () => {
  selectedEvent = undefined;
  selectedDevice = undefined;
  refreshNotebook();
};
$("device-list").onclick = (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>("[data-device]");
  if (el) {
    revealNotebook();
    selectedDevice = el.dataset.device;
    selectedEvent = undefined;
    setTab("Journey");
  }
};
$("event-list").onclick = (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>("[data-event]");
  if (el) {
    revealNotebook();
    selectedEvent = playback.result?.events.find(
      (e) => e.id === el.dataset.event,
    );
    selectedDevice = undefined;
    refreshNotebook();
    refreshTimeline();
  }
};
$("events-tab").onclick = () => {
  logMode = "events";
  $("events-tab").classList.add("selected");
  $("packets-tab").classList.remove("selected");
  refreshTimeline();
};
$("packets-tab").onclick = () => {
  logMode = "packets";
  $("packets-tab").classList.add("selected");
  $("events-tab").classList.remove("selected");
  refreshTimeline();
};
$("legend-toggle").onclick = () => {
  $("legend").hidden = !$("legend").hidden;
  $("legend-toggle").setAttribute("aria-expanded", String(!$("legend").hidden));
};
$("network-classroom").onclick = () => navigateModule(`#cn-unit-${Number(read("cn-unit", 1)) || 1}`);
$("osi-nav").onclick = () => {
  const layer = Number(read("osi-layer", 1));
  navigateModule(`#osi-layer-${layer >= 1 && layer <= 7 ? layer : 1}`);
};
$("module-menu").querySelectorAll<HTMLAnchorElement>("a[data-module]").forEach(link => {
  link.onclick = event => { event.preventDefault(); navigateModule(link.hash); };
});
$("settings").onclick = settings;
$("help").onclick = help;
$("credits").onclick = credits;
$("trail").onclick = () => navigateModule("#learning-trail");
$("learn-nav").onclick = () => $("network-classroom").click();
$("lab-nav").onclick = () => navigateModule("#network-lab");
$("brand").onclick = showHome;
$("home-link").onclick = showHome;
$("close-modal").onclick = closeModal;
$("modal").addEventListener("close", () => {
  if ($<HTMLDialogElement>("modal").open) return;
  formatReference?.destroy();
  formatReference=undefined;
  if (!$<HTMLDialogElement>("modal").open) {
    if (/^#(?:cn|cn-reference|java)-unit-|^#learning-trail$/.test(location.hash)) history.replaceState(null, "", "#network-lab");
    updateModuleNavigation();
  }
  classroomVisuals?.destroy();
  classroomVisuals = undefined;
});
$("expand-notebook").onclick = () => {
  const expanded = $("notebook-panel").classList.toggle("expanded");
  $("expand-notebook").setAttribute(
    "aria-label",
    expanded ? "Collapse notebook" : "Expand notebook",
  );
};
$("notebook-nav").onclick = () => {
  if (osiJourney) { $("osi-studio").querySelector(".osi-inspector, .connected-parcel")?.scrollIntoView({ behavior: reduced ? "instant" : "smooth", block: "center" }); return; }
  notebookOpen = !notebookOpen;
  $("notebook-nav").setAttribute("aria-expanded", String(notebookOpen));
  $("notebook-panel").hidden = !notebookOpen;
  document
    .querySelector(".workbench")!
    .classList.toggle("notebook-hidden", !notebookOpen);
};
$("sound").onclick = () => {
  muted = !muted;
  save("muted", muted);
  soundEffects.setEnabled(!muted);
  syncSoundControls();
  if(!muted) { soundEffects.unlock(); soundEffects.play("open"); }
};
$("import-file").onchange = async () => {
  const file = $<HTMLInputElement>("import-file").files?.[0];
  if (!file) return;
  try {
    const imported = importScenario(await file.text());
    config = imported.config;
    topology = imported.topology;
    scenario = "custom";
    if (
      !$<HTMLSelectElement>("scenario").querySelector('option[value="custom"]')
    )
      $<HTMLSelectElement>("scenario").add(
        new Option("Your imported experiment", "custom"),
      );
    $<HTMLSelectElement>("scenario").value = "custom";
    chapter = null;
    $("challenge").hidden = true;
    hosts();
    reset();
    syncForm();
    closeModal();
    notice("Scenario imported and validated. Send a message to explore it.");
  } catch (e) {
    closeModal();
    notice(`Import rejected: ${(e as Error).message}`, true);
  } finally {
    $<HTMLInputElement>("import-file").value = "";
  }
};
document.addEventListener("keydown", (e) => {
  if (
    e.key === "Escape" &&
    $("notebook-panel").classList.contains("expanded")
  ) {
    $("notebook-panel").classList.remove("expanded");
    $("expand-notebook").setAttribute("aria-label", "Expand notebook");
  }
  if (
    e.code === "Space" &&
    !$<HTMLDialogElement>("modal").open &&
    $("osi-studio").hidden &&
    !["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(
      (e.target as HTMLElement).tagName,
    )
  ) {
    e.preventDefault();
    $("play").click();
  }
});
let frame = 0,
  last = performance.now();
function animate(ms: number) {
  const dt = Math.min(0.1, (ms - last) / 1000);
  last = ms;
  const previousIndex = playback.index, wasPlaying = playback.playing;
  playback.tick(dt);
  if (wasPlaying && playback.index > previousIndex && $("osi-studio").hidden && !$<HTMLDialogElement>("modal").open) {
    const events = playback.result!.events.slice(previousIndex + 1, playback.index + 1);
    if(events.some(e => e.kind === "complete")) soundEffects.play("success");
    else if(events.some(e => e.kind === "failure")) soundEffects.play("error");
    else if(events.some(e => e.kind === "drop" || e.kind === "timeout")) soundEffects.play("drop");
    else if(events.some(e => e.kind === "transmit" || e.kind === "arrive")) soundEffects.play("hop");
  }
  classroomVisuals?.tick(dt);
  if (!$<HTMLDialogElement>("modal").open) osiJourney?.tick(dt);
  world.draw(
    {
      topology,
      events: visibleEvents(),
      time: playback.time,
      selected: selectedDevice ?? selectedEvent?.frame?.packet?.id,
      reduced,
      running: !!playback.result,
    },
    reduced ? 0 : ms / 1000,
  );
  if (ms - lastUI > 100 && (playback.playing || lastIndex !== playback.index)) {
    lastUI = ms;
    lastIndex = playback.index;
    refresh();
  }
  frame = requestAnimationFrame(animate);
}
frame = requestAnimationFrame(animate);
window.addEventListener("pagehide", (event) => {
  cancelAnimationFrame(frame);
  soundEffects.hide();
  if (!event.persisted) {
    osiJourney?.destroy();
    world.destroy();
    detachSounds();
    soundEffects.destroy();
  }
});
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    last = performance.now();
    soundEffects.unlock();
    frame = requestAnimationFrame(animate);
  }
});
$("event-list").addEventListener("focusout", () =>
  queueMicrotask(() => refreshTimeline()),
);
const prefs = read("network-preferences", null) as Partial<Config> | null;
if (prefs) {
  try {
    const candidate = { ...config };
    for (const key of [
      "seed",
      "loss",
      "ttl",
      "mss",
      "timeout",
      "retries",
      "reorder",
    ] as const)
      if (key in prefs)
        (candidate as unknown as Record<string, unknown>)[key] = prefs[key];
    validateConfig(candidate, topology);
    config = candidate;
  } catch {
    /* Ignore invalid saved preferences. */
  }
}
const savedTab = read("notebook-page", "Journey");
if (tabs.includes(savedTab as string)) tab = savedTab as string;
hosts();
syncForm();
refresh();
$("progress-label").textContent = `${completed.length} of 6 discoveries`;
syncSoundControls();
document.body.classList.toggle("reduced-motion", reduced);
function updateModuleNavigation(active?: string) {
  const hash = location.hash;
  const selectedModule = active ?? (hash === "#osi-connected" ? "connected" : /^#osi-layer-/.test(hash) ? "osi" : /^#(?:cn|cn-reference|java)-unit-/.test(hash) ? "classroom" : hash === "#learning-trail" ? "trail" : "lab");
  const module = selectedModule === "connected" ? "osi" : selectedModule === "trail" ? "lab" : selectedModule;
  $("module-menu").querySelectorAll<HTMLElement>("[data-module]").forEach(link => {
    if (link.dataset.module === module) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  $("lab-nav").classList.toggle("active", module === "lab");
  $("osi-nav").classList.toggle("active", module === "osi");
  $("learn-nav").classList.toggle("active", module === "classroom");
}
function navigateModule(hash: string) {
  if (location.hash === hash) openClassroomLink();
  else location.hash = hash;
}
function openClassroomLink() {
  if (location.hash === "#osi-connected") { showOsiConnected(); return true; }
  const osi = location.hash.match(/^#osi-layer-([1-7])$/);
  if (osi) { showOsiJourney(Number(osi[1])); return true; }
  leaveOsiJourney();
  const match = location.hash.match(/^#(?:cn|cn-reference|java)-unit-([1-5])$/);
  if (match) { showNetworkClassroom(Number(match[1])); return true; }
  if (location.hash === "#learning-trail") { showChapters(); return true; }
  if (location.hash === "#network-lab") { closeModal(); window.scrollTo({top:0,behavior:"instant"}); return true; }
  return false;
}
window.addEventListener("hashchange", () => openClassroomLink());
updateModuleNavigation();
if (!openClassroomLink() && !read("welcomed", false)) showHome();
