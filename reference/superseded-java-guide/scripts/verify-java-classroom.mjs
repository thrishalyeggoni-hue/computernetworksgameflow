import { createRequire } from "node:module";
import assert from "node:assert/strict";
import fs from "node:fs";
const { chromium } = createRequire(import.meta.url)(
  process.env.PLAYWRIGHT_MODULE || "playwright",
);
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({
      viewport: { width: 1440, height: 1100 },
    }),
    page = await context.newPage(),
    errors = [],
    checks = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto(process.env.APP_URL || "http://127.0.0.1:4173");
  await page
    .getByRole("button", { name: "Open sandbox", exact: false })
    .click();
  await page
    .getByRole("button", { name: "Java classroom", exact: false })
    .click();
  assert.match(await page.locator("#modal-content").innerText(), /25PC1CS201/);
  assert.match(
    await page.locator("#modal-content").innerText(),
    /Classroom theory/,
  );
  assert.equal(await page.locator("[data-java-unit]").count(), 5);
  checks.push("Exact theory course metadata and all five units are visible");
  assert(
    (await page.locator(".java-source a").getAttribute("href")).endsWith(
      "II-B.Tech-CYS-R25.pdf#page=5",
    ),
  );
  for (let id = 1; id <= 5; id++) {
    await page.locator(`[data-java-unit="${id}"]`).click();
    assert.equal(
      await page
        .locator(`[data-java-unit="${id}"]`)
        .getAttribute("aria-pressed"),
      "true",
    );
    assert((await page.locator(".java-topic").count()) >= 9);
    await page.locator("#java-expand").click();
    assert.equal(await page.locator(".java-topic:not([open])").count(), 0);
    assert.match(
      await page.locator(".java-bridge-note").innerText(),
      /does not execute Java/,
    );
    assert.match(
      await page.locator(".java-code-filename").innerText(),
      new RegExp(
        `Unit${["One", "Two", "Three", "Four", "Five"][id - 1]}Demo.java`,
      ),
    );
    await page.locator(".java-self-check summary").click();
    assert(await page.locator(".java-self-check p").isVisible());
  }
  checks.push(
    "All units expose explanations, Java examples, pitfalls, revision prompts, and self-check answers",
  );
  assert.match(
    await page.locator("#modal-content").innerText(),
    /Requires an existing, open JDBC Connection/,
  );
  assert(await page.locator("#java-next").isDisabled());
  await page.locator("#java-prev").click();
  assert.equal(
    await page.locator('[data-java-unit="4"]').getAttribute("aria-pressed"),
    "true",
  );
  await page.locator("#java-next").click();
  const downloading = page.waitForEvent("download");
  await page.locator("#java-download").click();
  const download = await downloading;
  const text = fs.readFileSync(await download.path(), "utf8");
  for (let i = 1; i <= 5; i++) assert(text.includes(`## Unit ${i}:`));
  assert(text.includes("laboratory course and experiment list are excluded"));
  checks.push("All-unit study notes download contains the five theory units");
  await page.locator("#close-modal").click();
  await page.locator("#java-classroom").click();
  assert.equal(
    await page.locator('[data-java-unit="5"]').getAttribute("aria-pressed"),
    "true",
  );
  checks.push("Unit selection is remembered on reopening");
  await page.locator('[data-java-unit="1"]').click();
  await page.screenshot({
    path: "docs/screenshots/java-classroom-desktop.png",
    fullPage: true,
  });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const size = await page
      .locator("#modal")
      .evaluate((el) => ({ width: el.clientWidth, scroll: el.scrollWidth }));
    assert(
      size.scroll <= size.width,
      `Dialog overflow at ${width}px: ${JSON.stringify(size)}`,
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "docs/screenshots/java-classroom-mobile.png",
    fullPage: true,
  });
  checks.push(
    "Classroom dialog fits 320/390/768/1440px widths; code and unit navigation scroll internally",
  );
  await page.locator("#java-scene").click();
  assert(await page.locator("#modal").evaluate((el) => !el.open));
  assert.equal(
    await page.locator("#notebook-page").inputValue(),
    "Packet Fields",
  );
  assert.match(await page.locator("#notice").innerText(), /network analogy/);
  await page.locator("#send").click();
  await page.locator("#play").click();
  await page.locator("#scrubber").fill("1000");
  assert.match(await page.locator("#delivery-status").innerText(), /Complete/);
  checks.push(
    "Analogy link opens a working suggested network experiment without claiming Java execution",
  );
  await page.goto(
    (process.env.APP_URL || "http://127.0.0.1:4173") + "/#java-unit-3",
  );
  assert.equal(
    await page.locator('[data-java-unit="3"]').getAttribute("aria-pressed"),
    "true",
  );
  checks.push("Direct unit links open the requested classroom page");
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    "docs/java-classroom-verification.json",
    JSON.stringify({ checks, browserErrors: errors }, null, 2) + "\n",
  );
  console.log("PASS: " + checks.join("; ") + ". No browser errors.");
} finally {
  await browser.close();
}
