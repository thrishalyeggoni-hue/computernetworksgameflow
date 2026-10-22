import { soundEffects } from '../audio/sound-effects';
import {
  networkUnits,
  type NetworkUnit,
} from "../learning/network-course";
import {
  visualUnits,
  type VisualFrame,
  type VisualNode,
} from "../learning/network-visuals";
import { escape as e } from "./network-notebook";
const colors = {
  blue: ["#dcecff", "#367cf5"],
  pink: ["#ffe1ef", "#e95199"],
  purple: ["#e9e1ff", "#8760e5"],
  mint: ["#d6f5e4", "#219f78"],
  orange: ["#ffedc9", "#e99830"],
  red: ["#ffe1da", "#e45c54"],
} as const;
const icons = ["⌘", "▦", "↔", "✉", "◎"],
  names = [
    "The big picture",
    "One local crossing",
    "Find the next hop",
    "A reliable conversation",
    "Services we use",
  ];
function lines(text: string, max = 22) {
  const out: string[] = [];
  for (const word of text.split(" ")) {
    if (!out.length || out[out.length - 1].length + word.length + 1 > max)
      out.push(word);
    else out[out.length - 1] += " " + word;
  }
  return out.slice(0, 3);
}
function svgText(
  text: string,
  x: number,
  y: number,
  size: number,
  color: string,
  max = 22,
) {
  return `<text x="${x}" y="${y}" fill="${color}" text-anchor="middle" font-size="${size}" font-weight="700">${lines(
    text,
    max,
  )
    .map(
      (line, i) =>
        `<tspan x="${x}" dy="${i ? size * 1.35 : 0}">${e(line)}</tspan>`,
    )
    .join("")}</text>`;
}
function card(
  node: VisualNode,
  x: number,
  y: number,
  w: number,
  focused: boolean,
) {
  const [pale, color] = colors[node.tone as keyof typeof colors] ?? colors.blue;
  return `<g class="concept-node ${focused ? "concept-focused" : ""}"><rect x="${x - w / 2 + 3}" y="${y + 5}" width="${w}" height="145" rx="23" fill="${color}" opacity=".13"/><rect x="${x - w / 2}" y="${y}" width="${w}" height="145" rx="23" fill="${pale}" stroke="${focused ? color : "#cdd9da"}" stroke-width="${focused ? 3 : 1.5}"/><circle cx="${x}" cy="${y + 39}" r="24" fill="${color}"/>${svgText(node.icon ?? "◇", x, y + 47, 21, "#fff", 12)}${svgText(node.label, x, y + 86, node.label.length > 20 ? 13 : 16, "#243e4c", w < 180 ? 17 : 24)}${svgText(node.sub ?? "", x, y + (node.label.length > 22 ? 121 : 111), 10, "#57717a", w < 180 ? 21 : 32)}${focused ? `<circle cx="${x + w / 2 - 14}" cy="${y + 14}" r="5" fill="${color}"/>` : ""}</g>`;
}
function compactDiagram(frame: VisualFrame): string {
  const count = frame.nodes.length;
  let drawing = "",
    height =
      frame.kind === "stack"
        ? 310
        : frame.kind === "topology"
          ? 340
          : count * 106 + 10;
  if (frame.kind === "stack")
    frame.nodes.forEach((node, i) => {
      const [pale, color] =
          colors[node.tone as keyof typeof colors] ?? colors.blue,
        y = 8 + i * 42;
      drawing += `<rect x="9" y="${y}" width="342" height="35" rx="9" fill="${pale}" stroke="${i === frame.focus ? color : "none"}" stroke-width="2.5"/><circle cx="27" cy="${y + 17}" r="11" fill="${color}"/>${svgText(node.icon ?? "", 27, y + 21, 10, "#fff")}<text x="45" y="${y + 22}" fill="#294652" font-size="11" font-weight="700">${e(node.label)}</text><text x="337" y="${y + 22}" text-anchor="end" fill="#58717b" font-size="9">${e(node.sub)}</text>`;
    });
  else if (frame.kind === "topology") {
    const points = [
      [87, 68],
      [273, 68],
      [273, 270],
      [87, 270],
      [180, 169],
    ];
    const edges =
      frame.shape === "star"
        ? [
            [0, 4],
            [1, 4],
            [2, 4],
            [3, 4],
          ]
        : frame.shape === "ring"
          ? [
              [0, 1],
              [1, 2],
              [2, 3],
              [3, 0],
            ]
          : [
              [0, 1],
              [1, 2],
              [2, 3],
              [3, 0],
              [0, 2],
              [1, 3],
            ];
    for (const [a, b] of edges)
      drawing += `<line x1="${points[a][0]}" y1="${points[a][1]}" x2="${points[b][0]}" y2="${points[b][1]}" stroke="#a4c9df" stroke-width="5"/>`;
    frame.nodes.forEach((node, i) => {
      const [pale, color] =
          colors[node.tone as keyof typeof colors] ?? colors.blue,
        [x, y] = points[i];
      drawing += `<rect x="${x - 46}" y="${y - 26}" width="92" height="52" rx="15" fill="${pale}" stroke="${color}" stroke-width="${i === frame.focus ? 3 : 1.5}"/>${svgText(node.label, x, y + 5, 13, "#294652", 13)}`;
    });
  } else
    frame.nodes.forEach((node, i) => {
      const [pale, color] =
          colors[node.tone as keyof typeof colors] ?? colors.blue,
        y = 10 + i * 106;
      drawing += `<rect x="16" y="${y}" width="328" height="86" rx="19" fill="${pale}" stroke="${i === frame.focus ? color : "#d1dfea"}" stroke-width="${i === frame.focus ? 2.5 : 1}"/><circle cx="57" cy="${y + 42}" r="23" fill="${color}"/>${svgText(node.icon ?? "◇", 57, y + 49, 18, "#fff", 9)}${svgText(node.label, 214, y + 31, 13, "#294652", 24)}${svgText(node.sub ?? "", 214, y + (node.label.length > 24 ? 70 : 58), 10, "#58717b", 29)}`;
      if (i < count - 1 && frame.kind !== "bands")
        drawing += `<path d="M180 ${y + 89}v12m-4-4 4 4 4-4" fill="none" stroke="#9cbcd0" stroke-width="2"/>`;
    });
  return `<svg viewBox="0 0 360 ${height}" class="concept-svg concept-compact" role="img" aria-label="${e(frame.caption)}"><title>${e(frame.caption)}</title>${drawing}</svg>`;
}
export function conceptDiagram(frame: VisualFrame, narrow = false): string {
  if (narrow) return compactDiagram(frame);
  let drawing = "";
  if (frame.kind === "stack") {
    frame.nodes.forEach((node, i) => {
      const [pale, color] =
          colors[node.tone as keyof typeof colors] ?? colors.blue,
        y = 16 + i * 40,
        active = i === frame.focus;
      drawing += `<rect x="170" y="${y}" width="560" height="34" rx="9" fill="${pale}" stroke="${active ? color : "none"}" stroke-width="3"/><circle cx="195" cy="${y + 17}" r="11" fill="${color}"/>${svgText(node.icon ?? "", 195, y + 21, 11, "#fff")}<text x="218" y="${y + 22}" fill="#294652" font-size="13" font-weight="700">${e(node.label)}</text><text x="710" y="${y + 22}" text-anchor="end" fill="#58717b" font-size="11">${e(node.sub)}</text>${active ? `<text x="149" y="${y + 23}" fill="${color}" text-anchor="end" font-size="20">➜</text>` : ""}`;
    });
  } else if (frame.kind === "topology") {
    const points = [
        [230, 75],
        [670, 75],
        [670, 245],
        [230, 245],
        [450, 160],
      ],
      count = frame.shape === "star" ? 5 : 4;
    const edges =
      frame.shape === "star"
        ? [
            [0, 4],
            [1, 4],
            [2, 4],
            [3, 4],
          ]
        : frame.shape === "ring"
          ? [
              [0, 1],
              [1, 2],
              [2, 3],
              [3, 0],
            ]
          : frame.shape === "bus"
            ? [
                [0, 1],
                [1, 2],
                [2, 3],
              ]
            : [
                [0, 1],
                [1, 2],
                [2, 3],
                [3, 0],
                [0, 2],
                [1, 3],
              ];
    for (const [a, b] of edges)
      drawing += `<line x1="${points[a][0]}" y1="${points[a][1]}" x2="${points[b][0]}" y2="${points[b][1]}" stroke="#a4c9df" stroke-width="7" stroke-linecap="round"/>`;
    frame.nodes.slice(0, count).forEach((node, i) => {
      const [pale, color] =
          colors[node.tone as keyof typeof colors] ?? colors.blue,
        [x, y] = points[i];
      drawing += `<rect x="${x - 59}" y="${y - 31}" width="118" height="62" rx="17" fill="${pale}" stroke="${color}" stroke-width="${i === frame.focus ? 4 : 2}"/>${svgText(node.label, x, y + 5, 17, "#294652")}`;
    });
  } else {
    const count = frame.nodes.length,
      w = count > 3 ? 176 : count === 3 ? 210 : count === 2 ? 260 : 310;
    const xs = frame.nodes.map((_, i) =>
      count === 1 ? 450 : 110 + (680 / (count - 1)) * i,
    );
    // With two or three items, keep the end cards clear of the viewBox edges.
    if (count === 2) {
      xs[0] = 230;
      xs[1] = 670;
    }
    if (count === 3) {
      xs[0] = 145;
      xs[1] = 450;
      xs[2] = 755;
    }
    if (frame.kind === "bands") {
      frame.nodes.forEach((node, i) => {
        const [pale, color] =
          colors[node.tone as keyof typeof colors] ?? colors.blue;
        const x = 70 + i * (760 / count),
          width = 760 / count - 12;
        drawing += `<rect x="${x}" y="65" width="${width}" height="184" rx="20" fill="${pale}" stroke="${color}" stroke-width="${i === frame.focus ? 3 : 1}"/>${svgText(node.icon ?? "", x + width / 2, 120, 28, color)}${svgText(node.label, x + width / 2, 168, 14, "#294652", 22)}${svgText(node.sub ?? "", x + width / 2, 203, 11, "#58717b", 24)}`;
      });
    } else {
      for (let i = 0; i < count - 1; i++) {
        const x1 = xs[i] + w / 2 + 6,
          x2 = xs[i + 1] - w / 2 - 8;
        drawing += `<path class="concept-wire" d="M ${x1} 155 L ${x2} 155" fill="none" stroke="#9cbcd0" stroke-width="3" marker-end="url(#cn-arrow)"/>${svgText(frame.arrows?.[i] ?? "", (x1 + x2) / 2, 190, 9, "#6e8999", 15)}`;
      }
      frame.nodes.forEach(
        (node, i) => (drawing += card(node, xs[i], 70, w, i === frame.focus)),
      );
    }
  }
  return `<svg viewBox="0 0 900 320" class="concept-svg" role="img" aria-label="${e(frame.caption)}"><title>${e(frame.caption)}</title><defs><marker id="cn-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8" fill="none" stroke="#9cbcd0" stroke-width="1.5"/></marker><pattern id="cn-dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#aecde3" opacity=".25"/></pattern></defs><rect width="900" height="320" fill="url(#cn-dots)"/><circle cx="74" cy="36" r="5" fill="#ffc3db"/><path d="M821 265h12m-6-6v12" stroke="#bd9bec" stroke-width="3" stroke-linecap="round"/>${drawing}</svg>`;
}
export function networkClassroom(unit: NetworkUnit): string {
  return `<section class="visual-classroom unit-theme-${unit.id}"><header class="visual-classroom-header"><div><span class="visual-eyebrow">COMPUTER NETWORKS · FOR EVERYONE</span><h2>See it. Try it. <em>Get it.</em></h2><p>Start with your unit. Pick a picture, press Play, and open extra notes when needed.</p></div><div class="visual-header-sticker" aria-hidden="true">✦<span>less reading<br>more discovering</span></div></header>
 ${unit.id===1?'<div class="classroom-osi-link"><span>Unit 1 visual tool · see the seven network jobs in action.</span><button id="cn-open-osi">Open OSI Explorer ↗</button></div>':''}
 <nav class="visual-unit-nav" aria-label="Computer Networks theory units">${networkUnits.map((u) => `<button data-cn-unit="${u.id}" class="unit-color-${u.id}" aria-pressed="${u.id === unit.id}"><span>${icons[u.id - 1]}</span><div><small>UNIT ${["I", "II", "III", "IV", "V"][u.id - 1]}</small><strong>${names[u.id - 1]}</strong></div></button>`).join("")}</nav>
 <div class="visual-unit-title"><div><span class="visual-eyebrow">UNIT ${unit.id} · ${unit.topics.length} LITTLE DISCOVERIES</span><h3 id="cn-unit-title" tabindex="-1">${e(unit.question)}</h3></div><span class="visual-tip">↓ Pick any topic</span></div>
 <div class="visual-topic-picker" role="group" aria-label="Concepts in unit ${unit.id}">${unit.topics.map((t, i) => `<button data-concept="${i}" aria-pressed="${i === 0}"><b>${String(i + 1).padStart(2, "0")}</b>${e(t.title)}</button>`).join("")}</div>
 <section class="concept-playground" aria-label="Interactive concept illustration"><div class="concept-topline"><span class="concept-mode">✦ VISUAL EXPLAINER</span><span id="concept-count"></span></div><h3 id="concept-title"></h3><div class="concept-controls"><button data-concept-action="previous" id="concept-back" class="secondary" aria-label="Previous visual step">←</button><button data-concept-action="play" id="concept-play" class="primary">▶ Play story</button><button data-concept-action="next" id="concept-next" class="secondary">Next step →</button><button data-concept-action="reset" class="concept-reset" aria-label="Replay visual story">↶</button><div id="concept-dots" aria-label="Story progress"></div></div><div id="concept-diagram"></div><div class="concept-caption"><span id="concept-step-number"></span><p id="concept-caption" aria-live="polite"></p></div><div id="concept-takeaway" class="concept-takeaway"></div></section>
 <div class="visual-lab-link"><div><b>Want to see real simulated packets?</b><span id="concept-coverage"></span></div><button id="cn-scene" class="secondary">Open network lab ↗</button></div>
 <details class="visual-reference"><summary>Need the classroom wording? <span>Optional notes +</span></summary><div id="concept-notes"></div></details>
 <details class="visual-reference"><summary>Worked example & revision <span>Optional +</span></summary><h4>${e(unit.worked.title)}</h4><ol>${unit.worked.steps.map((s) => `<li>${e(s)}</li>`).join("")}</ol><h4>Explain these aloud</h4><ul>${unit.revision.map((s) => `<li>${e(s)}</li>`).join("")}</ul><details class="visual-self-check"><summary>${e(unit.check.question)}</summary><p>${e(unit.check.answer)}</p></details></details>
 <div class="visual-bottom-nav"><button id="cn-prev" class="secondary" ${unit.id === 1 ? "disabled" : ""}>← Previous unit</button><button id="cn-download" class="text-button">↓ Full notes</button><button id="cn-next" class="primary" ${unit.id === 5 ? "disabled" : ""}>Next unit →</button></div>
 <footer class="visual-classroom-footer"><span>Five units · Learn at your own pace</span><span>Concept pictures are teaching illustrations, separate from the network simulation.</span></footer></section>`;
}
export function mountNetworkVisuals(host: HTMLElement, unit: NetworkUnit) {
  const stories = visualUnits[unit.id - 1];
  let topic = 0,
    step = 0,
    playing = false,
    elapsed = 0,
    disposed = false,
    narrow = host.clientWidth < 560;
  const el = (id: string) => host.querySelector<HTMLElement>("#" + id)!;
  function render() {
    const story = stories[topic],
      frame = story.frames[step],
      content = unit.topics[topic];
    el("concept-title").textContent = story.title;
    el("concept-count").textContent =
      `${topic + 1} / ${stories.length} concepts`;
    el("concept-diagram").innerHTML = conceptDiagram(frame, narrow);
    el("concept-step-number").textContent = String(step + 1).padStart(2, "0");
    el("concept-caption").textContent = frame.caption;
    el("concept-takeaway").innerHTML =
      `<span>💡</span><strong>${e(story.takeaway)}</strong>`;
    el("concept-dots").innerHTML = story.frames
      .map(
        (_, i) =>
          `<span ${i === step ? 'aria-current="step"' : ""} class="${i === step ? "current" : ""}"></span>`,
      )
      .join("");
    el("concept-play").textContent = playing ? "Ⅱ Pause story" : "▶ Play story";
    (el("concept-back") as HTMLButtonElement).disabled = step === 0;
    (el("concept-next") as HTMLButtonElement).disabled =
      step === story.frames.length - 1;
    el("concept-coverage").textContent =
      `Lab coverage: ${content.coverage.toLowerCase()}. ${content.coverage === "Theory only" ? "This concept is illustrated here; the lab does not implement it." : "The lab uses a teaching subset; open notes for its limits."}`;
    el("concept-notes").innerHTML =
      `<h4>In everyday words</h4><p>${e(content.plain)}</p><h4>In networking terms</h4><p>${e(content.detail)}</p><h4>Inside PacketVerse</h4><p>${e(content.connection)}</p><h4>A common mix-up</h4><p>${e(content.watch)}</p>`;
    host
      .querySelectorAll<HTMLElement>("[data-concept]")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(Number(button.dataset.concept) === topic),
        ),
      );
  }
  function onClick(event: MouseEvent) {
    const target = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-concept],[data-concept-action]",
    );
    if (!target) return;
    if (target.dataset.concept !== undefined) {
      topic = Number(target.dataset.concept);
      step = 0;
      playing = false;
      elapsed = 0;
      render();
      return;
    }
    const action = target.dataset.conceptAction;
    if (action === "play") {
      if (!playing && step === stories[topic].frames.length - 1) step = 0;
      playing = !playing;
      elapsed = 0;
    } else {
      playing = false;
      elapsed = 0;
      if (action === "next")
        step = Math.min(step + 1, stories[topic].frames.length - 1);
      if (action === "previous") step = Math.max(0, step - 1);
      if (action === "reset") step = 0;
    }
    render();
  }
  host.addEventListener("click", onClick);
  render();
  const nav = host.querySelector<HTMLElement>(".visual-unit-nav"),
    active = nav?.querySelector<HTMLElement>('[aria-pressed="true"]');
  if (nav && active)
    nav.scrollLeft =
      active.offsetLeft -
      nav.offsetLeft -
      (nav.clientWidth - active.clientWidth) / 2;
  return {
    tick(dt: number) {
      if (disposed) return;
      const nextNarrow = host.clientWidth < 560;
      if (nextNarrow !== narrow) {
        narrow = nextNarrow;
        render();
      }
      if (!playing) return;
      elapsed += dt;
      if (elapsed < 2.1) return;
      elapsed = 0;
      if (step < stories[topic].frames.length - 1) step++;
      if (step === stories[topic].frames.length - 1) playing = false;
      soundEffects.play(playing ? "hop" : "success");
      render();
    },
    destroy() {
      disposed = true;
      playing = false;
      host.removeEventListener("click", onClick);
    },
  };
}
