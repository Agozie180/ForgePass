/**
 * One-off screenshot driver for ForgePass docs.
 *
 * Drives the running production app through the full proof ceremony with the
 * system Chrome (no Chromium download) and writes the seven screenshots that
 * docs/screenshots/README.md specifies. Run with the app served locally:
 *
 *   npx next start -p 3100
 *   node scripts/capture-screenshots.mjs http://localhost:3100
 *
 * Not part of the app build — playwright-core is a dev-only convenience.
 */
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const BASE = process.argv[2] || "http://localhost:3100";
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "docs", "screenshots");
mkdirSync(OUT, { recursive: true });

const CHROME_CANDIDATES = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
];

const shot = async (page, name, opts = {}) => {
  await page.screenshot({ path: join(OUT, name), ...opts });
  console.log("captured", name);
};

const main = async () => {
  let executablePath;
  const { existsSync } = await import("node:fs");
  for (const c of CHROME_CANDIDATES) if (existsSync(c)) { executablePath = c; break; }
  if (!executablePath) throw new Error("No system Chrome/Edge found");

  const browser = await chromium.launch({ executablePath, headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  // 1. Landing — hero + architecture pipeline (disconnected state).
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  await shot(page, "landing.png", { clip: { x: 0, y: 0, width: 1440, height: 900 } });

  // 7. demo-vs-wallet — the connect gate with both Freighter + Demo buttons.
  await page.locator("#proof").scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await page.locator(".connect-gate").waitFor({ state: "visible" });
  await shot(page, "demo-vs-wallet.png", { clip: clipOf(await page.locator(".studio").boundingBox()) });

  // 2. wallet-connect — enable Demo Mode, then open the nav wallet menu showing
  //    the connected session (address + network + disconnect).
  await page.locator(".connect-gate button.ghost").click(); // "Use Demo Mode"
  await page.waitForTimeout(600);
  await page.locator("nav .wallet-connected").scrollIntoViewIfNeeded();
  await page.locator("nav .wallet-connected").click(); // open the session menu
  await page.waitForTimeout(400);
  await shot(page, "wallet-connect.png", { clip: { x: 0, y: 0, width: 1440, height: 360 } });
  await page.keyboard.press("Escape");
  await page.mouse.click(720, 700); // close menu

  // 3. reputation-engine — Proof Studio step 1: sliders + policy chips.
  await page.locator("#proof").scrollIntoViewIfNeeded();
  await page.locator(".field-grid").waitFor({ state: "visible" });
  await page.waitForTimeout(500);
  await shot(page, "reputation-engine.png", { clip: clipOf(await page.locator(".studio").boundingBox()) });

  // 4. proof-generation — step 2: the private score ring (91) + breakdown.
  await page.locator(".action-row button:has-text('Compute private score')").click();
  await page.locator(".score-ring").waitFor({ state: "visible" });
  await page.waitForTimeout(900);
  await shot(page, "proof-generation.png", { clip: clipOf(await page.locator(".studio").boundingBox()) });

  // Kick off proving → verified.
  await page.locator("button:has-text('Generate ZK proof')").click();
  await page.locator(".verify-panel").waitFor({ state: "visible", timeout: 15000 });
  await page.waitForTimeout(700);

  // 5. stellar-verification — the Stellar Verification Record panel.
  await page.locator(".verify-panel").scrollIntoViewIfNeeded();
  await shot(page, "stellar-verification.png", { clip: clipOf(await page.locator(".studio").boundingBox()) });

  // 6. credential — issue the credential, reveal the QR/share actions.
  await page.locator("button:has-text('Issue ForgePass Credential')").click();
  await page.locator(".passport-card").waitFor({ state: "visible" });
  await page.locator("button:has-text('QR code')").click();
  await page.waitForTimeout(900);
  await page.locator(".passport-stage").scrollIntoViewIfNeeded();
  await shot(page, "credential.png", { clip: clipOf(await page.locator(".studio").boundingBox()) });

  await browser.close();
  console.log("done");
};

function clipOf(box) {
  if (!box) return undefined;
  return {
    x: Math.max(0, Math.floor(box.x)),
    y: Math.max(0, Math.floor(box.y)),
    width: Math.min(1440, Math.ceil(box.width)),
    height: Math.ceil(box.height),
  };
}

main().catch((e) => { console.error(e); process.exit(1); });
