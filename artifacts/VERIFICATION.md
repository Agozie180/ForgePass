# ForgePass Artifact Verification

Verified locally on 2026-06-19.

## Noir ACIR

- Nargo: `1.0.0-beta.22`
- Noirc: `1.0.0-beta.22+c57152f91260ecdb9faad4efc20abb14b6d2ece7`
- Circuits compiled: income, balance, account age, transaction volume, trust score
- Trust Score tests: `2 passed`
- Canonical positive vector: score `91` proves threshold `80`
- Canonical negative vector: low score cannot claim qualification
- Integrity manifest: `artifacts/noir/SHA256SUMS`

## Soroban WASM

- Rust: `1.93.1`
- Soroban SDK: `22.0.11#34f7f53ae31e0fd02aab436a9872e79fa671ca02`
- Target: `wasm32v1-none`
- Stellar protocol metadata: `22`
- Stellar CLI validation: `v27.0.0`
- Integrity manifest: `artifacts/soroban/SHA256SUMS`

### ForgePassVerifier

- Artifact size: `14,150 bytes`
- SHA-256: `65acbea6aeabe7a35c429e27d47212cb96c7da4c8e8228b46708e039f55ff573`
- Exports: `initialize`, `set_paused`, `rotate_verifier`, `verify_and_consume`
- Errors: `Paused`, `Expired`, `Replay`, `InvalidTime`
- Receipt binds holder, policy, proof/public-input commitments, nullifier, proof
  type, issue time, and expiry.

### ForgePassRegistry

- Artifact size: `15,988 bytes`
- SHA-256: `c9a0fcf923b1a9b41ef8962fb0159d5e657bdee5fb96f8d0a74d91a71593e2dd`
- Exports: `initialize`, `create_passport`, `register_claim`, `revoke_claim`,
  `get_claim`
- Errors: `PassportExists`, `MissingPassport`, `ClaimExists`, `MissingClaim`

Both binaries were parsed successfully by `stellar contract inspect`. The CLI
recovered their contract specs, custom types, error enums, and Protocol 22
environment metadata, confirming they are valid Soroban contracts rather than
generic WASM modules.
