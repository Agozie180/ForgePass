YOU ARE A WORLD-CLASS TEAM OF:

- Stellar Core Developers
- Soroban Smart Contract Engineers
- Noir Circuit Engineers
- Zero-Knowledge Researchers
- Cryptographers
- Fintech Product Designers
- Security Engineers
- Startup Founders
- Hackathon Winners

Your task is NOT to create a new project.

Your task is to transform an existing project into a world-class hackathon submission.

Repository:

https://github.com/Agozie180/ForgePass

Live Deployment:

https://forge-pass.vercel.app/

Mission:

Upgrade ForgePass into the strongest possible implementation of the official Stellar Hackathon ideas:

1. Verifiable Off-Chain Computation
2. Private Credential / Reputation

Do not pivot away from ForgePass.

Do not redesign the project from scratch.

Do not remove working functionality.

Preserve the existing product and evolve it into a technically credible Zero-Knowledge application built on Stellar.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MANDATORY PREPARATION STEP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before writing any code:

Read and study these resources.

These are mandatory.

Stellar Skills:

https://skills.stellar.org/

ZK Proofs Skill:

https://skills.stellar.org/skills/zk-proofs/SKILL.md

Stellar ZK Documentation:

https://developers.stellar.org/docs/build/apps/zk

Stellar Privacy Documentation:

https://developers.stellar.org/docs/build/apps/privacy

Building With AI:

https://developers.stellar.org/docs/build/building-with-ai

Stellar Dev Skill Repository:

https://github.com/stellar/stellar-dev-skill

Stellar Wallets Kit:

https://stellarwalletskit.dev/

UltraHonk Soroban Verifier:

https://github.com/yugocabrio/rs-soroban-ultrahonk

Alternative UltraHonk Reference:

https://github.com/indextree/ultrahonk_soroban_contract

Noir Documentation:

https://noir-lang.org/docs/

Stellar Docs:

https://developers.stellar.org/

OpenZeppelin Stellar:

https://www.openzeppelin.com/networks/stellar

Study these resources first.

Then audit the existing ForgePass repository.

Then produce an implementation plan.

Then begin coding.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROJECT IDENTITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Project Name:

ForgePass

Tagline:

Forge Trust. Reveal Nothing.

Positioning:

ForgePass is a Zero-Knowledge Reputation Credential built on Stellar.

ForgePass enables users to prove financial credibility without revealing financial information.

Users never reveal:

- Income
- Balance
- Transaction Activity
- Account Age
- Reputation Score

Instead they reveal cryptographic proofs.

The verifier learns only:

TRUE

or

FALSE

Nothing else.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CORE CONCEPT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ForgePass combines:

Verifiable Off-Chain Computation

PLUS

Private Credential / Reputation

The application computes a reputation score locally.

The score never leaves the user device.

The score is converted into a Zero-Knowledge Proof.

The proof is verified on Stellar.

A ForgePass Reputation Credential is issued.

This is the central story of the project.

Everything should reinforce this narrative.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FLAGSHIP USE CASE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

User wants to prove credibility.

Examples:

- Loan eligibility
- Financial product qualification
- Marketplace reputation
- Freelancer trustworthiness
- Membership eligibility

Instead of revealing financial records:

The user proves:

Reputation Score > 80

without revealing:

- Income
- Balance
- Account Age
- Transaction Activity
- Reputation Score

This should become the flagship demo.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ARCHITECTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ForgePass should follow:

Private Data
↓
Off-Chain Reputation Computation
↓
Noir Circuit
↓
UltraHonk Proof
↓
Soroban Verification
↓
Stellar Verification Record
↓
ForgePass Credential

This architecture should be visible in:

UI

README

Architecture diagrams

Demo video

Documentation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OFF-CHAIN COMPUTATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This is the most important section.
Implement a local reputation engine.

Inputs:

Income

Balance

Account Age

Transaction Activity

Financial Consistency

Compute:

Reputation Score

Range:

0–100

This calculation happens locally.

Private data never leaves the user device.

Private data never goes on-chain.

Private data never appears in the credential.

Label clearly:

"Demo Reputation Model"

Do not present it as a real credit score.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REPUTATION MODEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Document clearly.

Example weighting:

Income:
25%

Balance:
25%

Account Age:
20%

Transaction Activity:
20%

Financial Consistency:
10%

Total:
100

Generate:

Reputation Score

Example:

91

The score remains private.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NOIR CIRCUITS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Implement or improve Noir circuits.

Required circuits:

Income Threshold

balance Threshold

Account Age Threshold

Transaction Threshold

Reputation Score Threshold

Flagship Circuit:

Prove:

Reputation Score > 80

without revealing score.

Document:

Inputs

Outputs

Constraints

Proof generation

Verification

Add sample files.

Add examples.

Add comments.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ULTRAHONK VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use UltraHonk architecture.

Use:

https://github.com/yugocabrio/rs-soroban-ultrahonk

as primary reference.

Use:

https://github.com/indextree/ultrahonk_soroban_contract

as secondary reference.

Implement clean verifier integration.

If full production integration is not feasible:

Build the architecture correctly.

Document clearly.

Never fake proof verification.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SOROBAN CONTRACTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Improve:

ForgePassVerifier

Responsibilities:

Proof Verification

Verification Records

Replay Protection Strategy

Verification Metadata

Improve:

ForgePassCredentialRegistry

Responsibilities:

Credential Issuance

Credential Tracking

Verification History

Never store:

Income

Balance

Transactions

Reputation Score

Store only:

Proof Metadata

Hashes

Verification Records

Credential Records

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STELLAR WALLET INTEGRATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use Stellar Wallets Kit.

Reference:

https://stellarwalletskit.dev/

Support Freighter.

Install:

npm install @stellar/freighter-api

Implement:

Wallet Detection

Connect Wallet

Get Public Key

Get Network

Disconnect

Persist Session

Display:

Wallet

Network

Status

Add wallet connection button:

Navigation

Proof Studio

Replace mock wallet address with real address.

Keep Demo Mode available.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEMO MODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Keep Demo Mode.

Demo Mode exists for judges.

Demo Mode should simulate:

Wallet

Inputs

Proof Flow

Credential Issuance

Clearly label:

Demo Mode

Never pretend demo mode is real verification.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REAL WALLET MODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Support:

Freighter Wallet

Display:

Wallet Address

Network

Connected Status

Issue credentials to connected address.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORGEPASS CREDENTIAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Rename Trust Passport to:

ForgePass Reputation Credential

Display:

Wallet Address

Network

Verification Status

Timestamp

Proof Hash

Verified Claims

Claims:

✓ Reputation Qualified

✓ Income Threshold Verified

✓ Balance Threshold Verified

✓ Account Age Verified

✓ Transaction Activity Verified

Never display:

Income

Balance

Transactions

Reputation Score

Add:

Copy Link

Share

QR Code

Notice:

"No private financial information is stored or revealed."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STELLAR VERIFICATION PANEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create visible verification details.

Display:

Network

Wallet

Timestamp

Ledger

Transaction Hash

Verification Status

Verifier Contract

Registry Contract

If demo:

Label clearly.

If testnet:

Label clearly.

Never fake mainnet activity.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WOW MOMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Demo Flow:

User enters private data

↓

ForgePass computes reputation locally

↓

Reputation score remains hidden

↓

Generate Noir Proof

↓

Generate UltraHonk Proof

↓

Verify on Stellar

↓

Private data disappears

↓

Credential appears

↓

Message:

"Reputation Verified. Privacy Preserved."

This should be the most memorable moment.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
README
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Rewrite professionally.

Include:

Problem

Solution

Architecture

Noir

UltraHonk

Soroban

Wallet Integration

Reputation Engine

Verifiable Off-Chain Computation

Private Credential Model

Screenshots

Security

Roadmap

Demo Script

Limitations

Future Work

Explain:

What is implemented

What is simulated

What is scaffolded

What is future work

Be honest.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCREENSHOTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

docs/screenshots

Required:

landing.png

wallet-connect.png

reputation-engine.png

proof-generation.png

stellar-verification.png

credential.png

demo-vs-wallet.png

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEMO VIDEO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create:

docs/demo-video-script.md

Length:

2–3 minutes

Show:

Problem

Wallet Connection

Local Reputation Computation

Noir Proof

UltraHonk Verification

Stellar Verification

Credential Issuance

Vision

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECURITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Document:

Privacy Guarantees

Replay Protection Strategy

Trust Assumptions

Wallet Security

Noir Assumptions

Soroban Assumptions

Demo Limitations

Future Production Security

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUALITY REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ensure:

npm install

npm run dev

npm run build

npm run lint

npm run typecheck

pass successfully.

Fix:

TypeScript issues

Broken UI

Console Errors

Hydration Issues

Mobile Responsiveness

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINAL OBJECTIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Build the strongest possible implementation of:

Verifiable Off-Chain Computation

PLUS

Private Credential / Reputation

on Stellar.

Judges should immediately understand:

ForgePass allows users to prove financial credibility without revealing financial data.

The final message should be:

Reputation Verified.
Privacy Preserved.

Forge Trust. Reveal Nothing.