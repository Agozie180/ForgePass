# ForgePass Demo Video Script (2–3 minutes)

Target length: **2:30**. Tone: confident, fast, privacy-first. Capture at 1440p,
light theme. Recommended companion stills live in `docs/screenshots/`.

---

## 0:00 — 0:20 · The problem (landing)

> "Every financial app makes you surrender data to earn trust — your income, your
> balance, your full history. ForgePass flips that. You prove you qualify, and
> reveal nothing."

- Open on the hero: **"Forge trust. Reveal nothing."**
- Scroll to the **Architecture** strip: Private data → Off-chain compute → Noir →
  UltraHonk → Soroban → Credential.
- Screenshot: `landing.png`.

## 0:20 — 0:40 · Connect (wallet)

> "ForgePass issues your credential to a Stellar account. Connect Freighter for a
> real Testnet address — or use Demo Mode, so anyone can run the full flow."

- Click **Connect wallet** in the nav → choose **Freighter** (show the address +
  network appear), then mention **Demo Mode** as the no-extension path.
- Screenshot: `wallet-connect.png`, `demo-vs-wallet.png`.

## 0:40 — 1:05 · Private inputs + off-chain computation

> "Here are my private signals. I can adjust them — and ForgePass computes a
> reputation score right here in the browser. Nothing is uploaded."

- In the Proof Studio, pick the **Prime Access** policy (`score > 80`).
- Drag the income / balance / activity sliders; values update live.
- Click **Compute private score**.
- Screenshot: `reputation-engine.png`.

## 1:05 — 1:25 · The private score

> "My score is 91. Useful — but the lender never needs to see it. Only the
> statement 'above 80' will leave this device."

- Show the score ring (91), the component breakdown, and the **Qualifies** badge.

## 1:25 — 1:45 · The proof (WOW moment)

> "Now ForgePass previews the Noir and UltraHonk proof step… and watch:
> every private value disappears."

- Click **Generate scaffolded proof**; let the Noir / UltraHonk scaffold animation complete.
- Land on **"Reputation verified. Privacy preserved."**
- Screenshot: `proof-generation.png`.

## 1:45 — 2:05 · Stellar verification

> "ForgePass is live on Stellar Testnet with deployed verifier and registry contracts. The demo shows the replay-safe verification record — network, commitments, nullifier, and contract links — while scaffolded proof-generation and transaction values are labeled honestly."

- Pan over the **Stellar Verification Record** panel and click the verifier/registry explorer links.
- Screenshot: `stellar-verification.png`.

## 2:05 — 2:25 · The credential

> "And here's the ForgePass Reputation Credential. Verified claims only — income,
> balance, age, activity, reputation — never the numbers. Copy the link, share
> it, or scan the QR."

- Click **Issue ForgePass Credential**; show the claims animate in.
- Click **QR code**, then **Copy link**. Point at the privacy notice.
- Screenshot: `credential.png`.

## 2:25 — 2:30 · Close

> "Reputation verified. Privacy preserved. ForgePass — forge trust, reveal nothing."

- Cut back to the hero logo.

---

### Recording checklist

- [ ] Browser zoom 100%, window ≥ 1440px wide (desktop layout).
- [ ] Freighter installed + set to **Testnet** for the wallet segment.
- [ ] Pre-set sliders so the score lands on a clean **91** for the hero take.
- [ ] Show the **Live on Stellar Testnet** contract IDs, then show at least one **"simulated/scaffolded"** label to reinforce honesty.
- [ ] Re-run once in **Demo Mode** to prove the flow works without an extension.
