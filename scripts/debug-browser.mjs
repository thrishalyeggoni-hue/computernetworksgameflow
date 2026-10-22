import { createRequire } from "node:module";
import assert from "node:assert/strict";
import fs from "node:fs";
const { chromium } = createRequire(import.meta.url)(
  process.env.PLAYWRIGHT_MODULE || "playwright",
);
const browser = await chromium.launch({ headless: true });
let debugPage;
try {
  const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
    }),
    errors = [],
    checks = [];
  debugPage = page;
  page.setDefaultTimeout(10000);
  const push = checks.push.bind(checks);
  checks.push = (...items) => {
    console.log(...items);
    return push(...items);
  };
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto(process.env.APP_URL || "http://127.0.0.1:5173");
  await page
    .getByRole("button", { name: "Open sandbox", exact: false })
    .click();
  assert(await page.locator("#replay").isDisabled());
  checks.push("Replay is disabled before a run");
  await page.locator("#message").fill("Stable message");
  await page.locator("#send").click();
  await page.locator("#play").click();
  await page.locator("#scrubber").fill("1000");
  await page.locator("#notebook-page").selectOption("Encapsulation");
  assert.match(
    await page.locator("#notebook-content").innerText(),
    /14 UTF-8 bytes/,
  );
  await page.locator("#message").fill("");
  await page.locator("#send").click();
  assert.match(await page.locator("#notice").innerText(), /1–512/);
  await page.locator("#notebook-page").selectOption("Journey");
  await page.locator("#notebook-page").selectOption("Encapsulation");
  assert.match(
    await page.locator("#notebook-content").innerText(),
    /14 UTF-8 bytes/,
  );
  checks.push("Rejected input preserves the last valid notebook configuration");
  await page.locator("#message").fill("Stable message");
  await page.locator("#sender").selectOption("b");
  await page.locator("#send").click();
  assert.match(
    await page.locator("#notice").innerText(),
    /different computers/,
  );
  await page.locator("#sender").selectOption("a");
  checks.push("Invalid endpoint selection produces an explanation");
  // Reset must clear the trace, delivery strip, and navigation state.
  await page.locator("#reset").click();
  assert(await page.locator("#replay").isDisabled());
  assert(await page.locator("#delivery-strip").isHidden());
  await page.locator("#send").click();
  await page.locator("#play").click();
  await page.locator("#scrubber").fill("400");
  await page.locator("#packets-tab").click();
  const first = page.locator("#event-list [data-event]").first();
  await first.focus();
  const focusedID = await first.getAttribute("data-event");
  await page.evaluate(() => document.querySelector("#play").click());
  await page.waitForFunction(
    () => parseFloat(document.querySelector("#time-label").textContent) > 450,
    {},
    { timeout: 15000 },
  );
  assert.equal(
    await page.evaluate(() =>
      document.activeElement.getAttribute("data-event"),
    ),
    focusedID,
  );
  checks.push("Live timeline updates preserve keyboard focus");
  await page.locator("#play").click();
  await page.locator("#notebook-nav").click();
  assert(await page.locator("#notebook-panel").isHidden());
  await page.locator('[data-device="r1"]').click();
  assert(await page.locator("#notebook-panel").isVisible());
  checks.push("Device inspection reopens a hidden notebook");
  await page.locator("#expand-notebook").click();
  assert(
    await page
      .locator("#notebook-panel")
      .evaluate((el) => el.classList.contains("expanded")),
  );
  await page.keyboard.press("Escape");
  assert(
    !(await page
      .locator("#notebook-panel")
      .evaluate((el) => el.classList.contains("expanded"))),
  );
  checks.push("Escape collapses expanded inspection");
  await page.locator("#unpin").click();
  await page.locator("#settings").click();
  assert.equal(await page.locator("#play").getAttribute("aria-label"), "Play");
  await page.locator('input[name="seed"]').fill("123");
  await page.locator('input[name="mss"]').fill("5");
  await page.getByRole("button", { name: "Save settings" }).click();
  await page.reload();
  await page.locator("#settings").click();
  assert.equal(await page.locator('input[name="seed"]').inputValue(), "123");
  assert.equal(await page.locator('input[name="mss"]').inputValue(), "5");
  await page.locator("#close-modal").click();
  checks.push("Settings persist after reload");
  // Repeated settings/modal interactions do not run hidden playback clocks.
  await page.locator("#send").click();
  await page.locator("#help").click();
  const paused = await page.locator("#time-label").innerText();
  await page
    .locator("#modal-content")
    .getByText("Curiosity is the only prerequisite.")
    .waitFor();
  assert.equal(await page.locator("#play").getAttribute("aria-label"), "Play");
  await page.locator("#close-modal").click();
  assert.equal(await page.locator("#time-label").innerText(), paused);
  checks.push("Dialogs pause the simulation playback");
  await page.locator("#trail").click();
  await page.locator('[data-chapter="3"]').click();
  await page.locator("#send").click();
  await page.locator("#play").click();
  await page.locator("#scrubber").fill("1000");
  assert.match(
    await page.locator("#challenge-status").innerText(),
    /Discovery made/,
  );
  await page.locator("#settings").click();
  await page.locator("#clear").click();
  assert(await page.locator("#challenge").isHidden());
  assert.match(await page.locator("#progress-label").innerText(), /0 of 6/);
  await page.locator("#notebook-page").selectOption("Metrics");
  assert.match(await page.locator("#progress-label").innerText(), /0 of 6/);
  checks.push(
    "Cleared lesson progress is not immediately reawarded from an old run",
  );
  await page.locator("#scenario").selectOption("delivery");
  await page.locator("#faults").click();
  await page.locator("#delay-l3").fill("180");
  await page.locator('[data-delay="l3"]').click();
  await page.locator("#send").click();
  await page.locator("#play").click();
  await page.locator("#scrubber").fill("1000");
  await page.locator("#faults").click();
  assert.equal(await page.locator("#delay-l3").inputValue(), "180");
  await page.locator("#close-modal").click();
  checks.push("Fault editor shows the currently applied delay");
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const size = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      width: document.documentElement.clientWidth,
    }));
    assert(size.scroll <= size.width, `Overflow at ${width}px`);
  }
  checks.push("No document overflow at 320, 390, 768, 1024, or 1440 pixels");
  // Every guided lesson must be achievable from its preset and notebook views.
  for (let chapter = 0; chapter < 6; chapter++) {
    await page.locator("#trail").click();
    await page.locator(`[data-chapter="${chapter}"]`).click();
    await page.locator("#send").click();
    await page.locator("#play").click();
    await page.locator("#scrubber").fill("1000");
    for (const name of [
      "Encapsulation",
      "ARP Cache",
      "MAC Tables",
      "Routing Tables",
    ])
      await page.locator("#notebook-page").selectOption(name);
    assert.match(
      await page.locator("#challenge-status").innerText(),
      /Discovery made/,
      `Chapter ${chapter + 1}`,
    );
  }
  checks.push("All six guided lessons satisfy their actual objectives");
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    "docs/debug-verification.json",
    JSON.stringify({ checks, browserErrors: errors }, null, 2) + "\n",
  );
  console.log("PASS: " + checks.join("; ") + ". No browser errors.");
} catch (error) {
  if (debugPage) {
    await debugPage.screenshot({
      path: "docs/screenshots/debug-failure.png",
      fullPage: true,
    });
    console.log(
      await debugPage
        .locator("#modal")
        .evaluate((el) => ({ open: el.open, content: el.innerText })),
    );
  }
  throw error;
} finally {
  await browser.close();
}
