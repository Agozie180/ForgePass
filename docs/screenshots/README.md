# Screenshots

These are captured from the live app at 1440px / 2× DPI and embedded in the root
`README.md` and `docs/demo-video-script.md`. Regenerate them after UI changes
with `node scripts/capture-screenshots.mjs` (drives the running production app
through the full flow using system Chrome — start it first with `npx next start`).

| File | What it shows |
| --- | --- |
| `landing.png` | Hero — "Forge trust. Reveal nothing." + the architecture pipeline. |
| `wallet-connect.png` | Nav wallet menu / connected Freighter address + network. |
| `reputation-engine.png` | Proof Studio step 1 — editable private signal sliders + policy chips. |
| `proof-generation.png` | Step 2/3 — private score ring (91) or the Noir/UltraHonk proving animation. |
| `stellar-verification.png` | The Stellar Verification Record panel (network, ledger, commitments, contracts). |
| `credential.png` | The ForgePass Reputation Credential with verified claims + QR / share actions. |
| `demo-vs-wallet.png` | The connect gate showing both **Connect Freighter** and **Demo Mode**. |

Tips:

- Use the **Prime Access** policy so the threshold is `score > 80`.
- Pre-set the sliders so the score lands on **91** for a clean hero shot.
- Include at least one frame showing a **"(simulated)"** label for honesty.
