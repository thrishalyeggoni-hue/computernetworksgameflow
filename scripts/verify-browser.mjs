import { createRequire } from "node:module";
import assert from "node:assert/strict";
import fs from "node:fs";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1100 },
  deviceScaleFactor: 1,
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
await page.goto(process.env.APP_URL || "http://127.0.0.1:5173");
await page.getByRole("button", { name: "Open sandbox" }).click();
await page.screenshot({ path: "docs/screenshots/desktop.png", fullPage: true });
await page
  .getByRole("textbox", { name: "Your message" })
  .fill("Hello 🌏 नमस्ते");
await page.getByRole("button", { name: "Send message" }).click();
await page.getByRole("button", { name: "Pause", exact: true }).click();
await page.locator("#scrubber").fill("720");
await page.screenshot({
  path: "docs/screenshots/packets-in-flight.png",
  fullPage: true,
});
await page.locator("#scrubber").fill("450");
await page.getByRole("button", { name: "Packet list", exact: true }).click();
assert((await page.locator("#event-list [data-event]").count()) > 0);
await page.locator("#event-list [data-event]").first().click();
await page.getByRole("button", { name: "Fields", exact: true }).click();
assert.match(await page.locator("#notebook-content").innerText(), /Source MAC/);
await page
  .getByRole("button", { name: "Drop next data", exact: false })
  .click();
await page.locator("#scrubber").fill("1000");
if (await page.getByRole("button", { name: "Follow live" }).isVisible())
  await page.getByRole("button", { name: "Follow live" }).click();
assert.match(
  await page.locator("#received-message").innerText(),
  /Hello 🌏 नमस्ते/,
);
await page
  .getByRole("combobox", { name: "Notebook page", exact: true })
  .selectOption("Metrics");
console.log(
  "Metrics after injected one-shot loss:",
  await page.locator("#notebook-content").innerText(),
);
assert.match(
  await page.locator("#notebook-content").innerText(),
  /Dropped frames \/ packets\s+1/,
);
assert.match(
  await page.locator("#notebook-content").innerText(),
  /Retransmissions\s+[1-9]/,
);
await page.getByRole("button", { name: "Replay journey" }).click();
await page.getByRole("button", { name: "Pause", exact: true }).click();
assert.match(await page.locator("#time-label").innerText(), /^[0-9.]+ ms/);
await page.locator("#scrubber").fill("1000");
assert.match(
  await page.locator("#received-message").innerText(),
  /Hello 🌏 नमस्ते/,
);
await page.screenshot({
  path: "docs/screenshots/delivery.png",
  fullPage: true,
});
// Guided recovery chapter evaluates its event-backed objective at the end.
await page.locator("#trail").click();
await page.locator('[data-chapter="3"]').click();
await page.getByRole("button", { name: "Send message" }).click();
await page.getByRole("button", { name: "Pause", exact: true }).click();
await page.locator("#scrubber").fill("1000");
assert.match(
  await page.locator("#challenge-status").innerText(),
  /Discovery made/,
);
// UDP loss remains incomplete and has no transport recovery.
await page
  .getByRole("combobox", { name: "Scenario", exact: true })
  .selectOption("udp");
await page.getByRole("button", { name: "Send message" }).click();
await page.getByRole("button", { name: "Pause", exact: true }).click();
await page.locator("#scrubber").fill("1000");
assert.match(await page.locator("#delivery-status").innerText(), /Failed/);
await page
  .getByRole("combobox", { name: "Notebook page", exact: true })
  .selectOption("Metrics");
assert.match(
  await page.locator("#notebook-content").innerText(),
  /Retransmissions\s+0/,
);
await page
  .getByRole("combobox", { name: "Scenario", exact: true })
  .selectOption("reroute");
await page.getByRole("button", { name: "Send message" }).click();
await page.getByRole("button", { name: "Pause", exact: true }).click();
await page.locator("#scrubber").fill("1000");
assert.match(await page.locator("#delivery-status").innerText(), /Complete/);
await page
  .getByRole("combobox", { name: "Notebook page", exact: true })
  .selectOption("Routing Tables");
assert.match(
  await page.locator("#notebook-content").innerText(),
  /10\.0\.0\.6/,
);
// Narrow layout must keep the document within the viewport. The scene itself can pan.
await page.setViewportSize({ width: 390, height: 844 });
await page.getByRole("button", { name: "Reset", exact: false }).click();
await page
  .getByRole("combobox", { name: "Notebook page", exact: true })
  .selectOption("Journey");
await page.screenshot({ path: "docs/screenshots/mobile.png", fullPage: true });
const size = await page.evaluate(() => ({
  width: document.documentElement.clientWidth,
  scroll: document.documentElement.scrollWidth,
}));
assert(
  size.scroll <= size.width,
  `Document overflows: ${JSON.stringify(size)}`,
);
await page.getByRole("button", { name: "Settings", exact: true }).click();
await page.locator('input[name="reduced"]').check();
await page.getByRole("button", { name: "Save settings" }).click();
assert(
  await page
    .locator("body")
    .evaluate((e) => e.classList.contains("reduced-motion")),
);
await page.getByRole("button", { name: "Settings", exact: true }).click();
const downloadEvent = page.waitForEvent("download");
await page
  .getByRole("button", { name: "Export scenario", exact: false })
  .click();
const download = await downloadEvent;
const scenarioJSON = JSON.parse(fs.readFileSync(await download.path(), "utf8"));
assert.equal(scenarioJSON.version, 1);
scenarioJSON.config.message = "Restored experiment 🌏";
await page.locator("#import-file").setInputFiles({
  name: "scenario.json",
  mimeType: "application/json",
  buffer: Buffer.from(JSON.stringify(scenarioJSON)),
});
await page.getByRole("button", { name: "Send message" }).click();
await page.getByRole("button", { name: "Pause", exact: true }).click();
await page.locator("#scrubber").fill("1000");
assert.match(
  await page.locator("#received-message").innerText(),
  /Restored experiment 🌏/,
);
await page.getByRole("button", { name: "Settings", exact: true }).click();
await page.locator("#import-file").setInputFiles({
  name: "bad.json",
  mimeType: "application/json",
  buffer: Buffer.from('{"version":2}'),
});
await page.locator("#notice").waitFor({ state: "visible" });
assert.match(await page.locator("#notice").innerText(), /Import rejected/);
assert.equal(await page.locator("#modal").evaluate((e) => e.open), false);
assert.deepEqual(errors, []);
console.log(
  "PASS: send → inspect → timed fault → recover → replay; chapter progress; UDP failure; reroute; 390px layout; reduced motion. No browser errors.",
);
fs.writeFileSync(
  "docs/browser-verification.json",
  JSON.stringify(
    {
      viewport: [1440, 1100],
      mobile: [390, 844],
      checks: [
        "message submission",
        "packet field inspection",
        "timed one-shot loss recovery",
        "replay",
        "event-based lesson completion",
        "UDP no automatic recovery",
        "alternative routing",
        "no document overflow at 390px",
        "reduced motion setting",
        "browser JSON export/import round trip",
        "invalid JSON import explanation",
      ],
      browserErrors: errors,
    },
    null,
    2,
  ) + "\n",
);
await browser.close();
