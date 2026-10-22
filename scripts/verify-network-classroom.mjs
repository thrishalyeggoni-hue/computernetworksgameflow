import { createRequire } from "node:module";
import assert from "node:assert/strict";
import fs from "node:fs";
import { networkUnits } from "../src/learning/network-course.ts";
import { visualUnits } from "../src/learning/network-visuals.ts";
const { chromium } = createRequire(import.meta.url)(
  process.env.PLAYWRIGHT_MODULE || "playwright",
);
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({
      viewport: { width: 1440, height: 1100 },
    }),
    errors = [],
    checks = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  const base = process.env.APP_URL || "http://127.0.0.1:4173";
  await page.goto(base + "/#cn-unit-1");
  assert.equal(await page.locator("[data-cn-unit]").count(), 5);
  assert.match(
    await page.locator(".visual-classroom-header h2").innerText(),
    /See it. Try it. Get it./,
  );
  assert.match(await page.locator('.visual-classroom-footer').innerText(), /Learn at your own pace/);
  assert.doesNotMatch(await page.locator('#modal-content').innerText(), /VNRVJIET|R25|CYS|25PC1CY201/);
  assert.equal(await page.locator(".visual-reference[open]").count(), 0);
  checks.push("Diagrams are primary; detailed theory starts collapsed");
  let stories = 0,
    steps = 0;
  for (let unit = 0; unit < 5; unit++) {
    assert.equal(visualUnits[unit].length, networkUnits[unit].topics.length);
    await page.locator(`[data-cn-unit="${unit + 1}"]`).click();
    assert.equal(
      await page.locator("[data-concept]").count(),
      visualUnits[unit].length,
    );
    for (let topic = 0; topic < visualUnits[unit].length; topic++) {
      await page.locator(`[data-concept="${topic}"]`).click();
      const story = visualUnits[unit][topic];
      assert.equal(
        await page.locator("#concept-title").innerText(),
        story.title,
      );
      for (let step = 0; step < story.frames.length; step++) {
        if (step) await page.locator("#concept-next").click();
        assert.equal(
          await page.locator("#concept-caption").innerText(),
          story.frames[step].caption,
        );
        assert.equal(
          await page.locator("#concept-diagram svg").getAttribute("aria-label"),
          story.frames[step].caption,
        );
        assert(
          (await page.locator("#concept-diagram svg text").count()) >=
            story.frames[step].nodes.length,
        );
        steps++;
      }
      assert(await page.locator("#concept-next").isDisabled());
      await page.getByRole("button", { name: "Replay visual story" }).click();
      assert.equal(
        await page.locator("#concept-step-number").innerText(),
        "01",
      );
      stories++;
    }
  }
  checks.push(
    `${stories} topic-specific visual stories and ${steps} steps render across all five units`,
  );
  await page.locator('[data-cn-unit="1"]').click();
  await page.locator("#concept-play").click();
  await page.waitForFunction(
    () => document.querySelector("#concept-step-number").textContent === "02",
    null,
    { timeout: 8000 },
  );
  await page.locator("#concept-play").click();
  const paused = await page.locator("#concept-caption").innerText();
  await page.waitForTimeout(500);
  assert.equal(await page.locator("#concept-caption").innerText(), paused);
  checks.push("Play advances and Pause freezes the shared-loop visual story");
  await page.locator('[data-concept="4"]').focus();
  await page.keyboard.press("Space");
  assert.match(await page.locator("#concept-title").innerText(), /layers/);
  checks.push("Concept selection is keyboard accessible");
  await page.locator('[data-cn-unit="2"]').click();
  await page.locator('[data-concept="8"]').click();
  await page.screenshot({
    path: "docs/screenshots/visual-classroom-desktop.png",
    fullPage: true,
  });
  await page.locator("#concept-next").click();
  await page.screenshot({
    path: "docs/screenshots/visual-classroom-gbn.png",
    fullPage: true,
  });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.waitForFunction(
      () =>
        document.querySelector("#modal-content").clientWidth >= 560 ||
        document
          .querySelector("#concept-diagram svg")
          .getAttribute("viewBox")
          .startsWith("0 0 360"),
    );
    const sizes = await page.evaluate(() => {
      const m = document.querySelector("#modal"),
        d = document.querySelector("#concept-diagram");
      return {
        modal: [m.clientWidth, m.scrollWidth],
        diagram: [d.clientWidth, d.scrollWidth],
      };
    });
    assert(
      sizes.modal[1] <= sizes.modal[0],
      `Modal overflow at ${width}: ${JSON.stringify(sizes)}`,
    );
    assert(
      sizes.diagram[1] <= sizes.diagram[0],
      `Diagram overflow at ${width}: ${JSON.stringify(sizes)}`,
    );
  }
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.locator('[data-cn-unit="3"]').click();
  await page.locator('[data-concept="6"]').click();
  await page.screenshot({
    path: "docs/screenshots/visual-classroom-mobile.png",
    fullPage: true,
  });
  checks.push(
    "Responsive diagrams fit narrow screens without horizontal panning",
  );
  await page
    .locator(".visual-reference")
    .first()
    .locator("summary")
    .first()
    .click();
  assert.match(await page.locator("#concept-notes").innerText(), /TTL/);
  checks.push("Selected-topic classroom detail remains available on request");
  const downloading = page.waitForEvent("download");
  await page.locator("#cn-download").click();
  const download = await downloading;
  const bytes = fs.readFileSync(await download.path());
  assert.equal(bytes.subarray(0,5).toString(), "%PDF-");
  assert(download.suggestedFilename().endsWith(".pdf"));
  assert(bytes.length>50000);
  checks.push("All five units download as the structured PDF");
  await page.locator("#cn-scene").click();
  assert(await page.locator("#modal").evaluate((e) => !e.open));
  await page.locator("#send").click();
  await page.locator("#play").click();
  await page.locator("#scrubber").fill("1000");
  assert.match(await page.locator("#delivery-status").innerText(), /Complete/);
  checks.push("The live packet lab still works from the visual guide");
  await page.goto(base + "/#java-unit-1");
  assert(await page.locator(".visual-classroom").isVisible());
  checks.push("Legacy classroom links still open the corrected course");
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    "docs/network-classroom-verification.json",
    JSON.stringify({ checks, stories, steps, browserErrors: errors }, null, 2) +
      "\n",
  );
  console.log("PASS: " + checks.join("; ") + ". No browser errors.");
} finally {
  await browser.close();
}
