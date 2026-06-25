# Demo Script

A concise live walkthrough of the ForgePass Proof Studio. For the recorded
version see [`demo-video-script.md`](demo-video-script.md).

## Live demo (about 2 minutes)

**0:00 — The problem**

> "Every financial application asks people to surrender data to earn trust. With
> ForgePass, the institution asks a better question: can you prove you qualify?"

Open the landing page and scroll the architecture pipeline: Private data →
Off-chain compute → Noir → UltraHonk → Soroban → Credential.

**0:20 — Connect**

Click **Connect wallet**. Choose **Freighter** to bind a real Stellar Testnet
address, or **Demo Mode** to run the flow with no extension (always labeled
"Demo"). The address and network appear in the nav and the Proof Studio.

**0:35 — Private inputs (off-chain computation)**

In the Proof Studio, select the **Prime Access** policy (`score > 80`). Adjust
the income / balance / activity sliders — the values are held only in the
browser. Click **Compute private score**.

**0:55 — Private score**

Show the score of `91`, the component breakdown, and the **Qualifies** badge
against the policy threshold. "The score is useful, but the lender does not need
to see it." Click **Generate scaffolded proof**.

**1:15 — Wow moment**

Let the Noir / UltraHonk scaffold animation finish. The private values and score
disappear. Land on **"Reputation verified. Privacy preserved."** and **0 private
values**.

**1:30 — Stellar verification**

Pan the **Stellar Verification Record**: network, ledger, proof commitment,
nullifier, verifier and registry contracts. Note that simulated values are
labeled "(simulated)". Click **Issue ForgePass Credential**.

**1:45 — Credential**

Show the **ForgePass Reputation Credential** — verified claims only (income,
balance, age, activity, reputation). Use **Copy link**, **Share**, and **QR
code**. Point at the notice: *no private financial information is stored or
revealed.*

**2:00 — Close**

> "Today: show me your data. Tomorrow: prove you qualify. Reputation verified,
> privacy preserved — forge trust, reveal nothing."

## Shot list (60-second cut)

| Time | Visual | Voiceover |
| --- | --- | --- |
| 0-7s | Landing headline, slow push-in | "Trust online still requires exposure." |
| 7-16s | Editable private signals | "ForgePass turns private financial signals into proof." |
| 16-24s | Score resolves to 91 | "A private reputation score is computed locally." |
| 24-35s | Noir / UltraHonk scaffold animation | "Zero knowledge proves only the required predicate." |
| 35-44s | Values blur and disappear | "The score and every input vanish." |
| 44-52s | Stellar verification record | "Stellar anchors a replay-safe verification." |
| 52-60s | Credential assembles | "Forge trust. Reveal nothing." |

Use restrained sound design: muted input clicks, a rising proof tone, then one
clean confirmation note at verification. Never show invented explorer footage as
a real transaction; use a deployed Testnet transaction or label the preview as a
simulation (the UI already does this).
