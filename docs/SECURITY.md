# ForgePass Security Model

## Protected assets

- Raw income, balance, account-age and transaction data.
- The exact reputation score and its component scores.
- Holder secrets, source credentials and proof witnesses.
- Integrity and non-transferability of ForgePass Reputation Credential claims.
- Availability and integrity of verifier and registry contracts.

## Privacy guarantees

A valid zero-knowledge proof reveals only its public inputs: protocol/circuit
version, policy commitment, holder binding, source epoch commitment, nullifier
and successful predicate result. ForgePass application logs and PostgreSQL rows
must never contain witnesses, raw source payloads, exact scores or proof bytes.

ZK does not hide network metadata, wallet identity, timing, policy choice or the
fact that a proof was created. Reusing a wallet across services remains linkable.

## Trust assumptions

1. Noir, the proving backend and compiled verification key are correct.
2. The circuit hash and policy commitment shown to the holder match verification.
3. Source issuers attest authentic, fresh data and protect signing keys.
4. The verifier quorum verifies proofs faithfully until native verification is available.
5. Stellar consensus and Soroban authorization behave as specified.
6. The holder device is not compromised while processing private inputs.

## Replay protection strategy

Every proof carries a domain-separated `nullifier` derived from the holder, the
policy, and the score/circuit version (`lib/proof/forge.ts`). The
`ForgePassVerifier` contract consumes the nullifier atomically — a second
submission of the same `(holder, policy)` proof is rejected with `Replay`. The
nullifier domain also folds in the network passphrase and contract address so a
receipt cannot be replayed across networks or contracts. Per-policy nullifiers
keep distinct eligibility checks unlinkable to each other.

## Wallet security

- ForgePass requests **read-only** wallet data: public address and network. It
  never requests private keys or seed phrases, and never signs a transaction
  without explicit, contextual Freighter authorization.
- The credential is bound to the connected address via `holder_binding`, so a
  proof issued for one wallet cannot be presented by another.
- Session state persisted in `localStorage` is limited to the chosen mode and a
  public address; clearing it (Disconnect) fully resets the session.
- **Demo Mode** uses a clearly labeled, non-custodial placeholder address and
  performs no signing. It exists only so judges can run the flow without an
  extension and must never be presented as a real wallet.

## Noir / circuit assumptions

- The compiled ACIR and verification key match the source in `circuits/` and the
  pinned `nargo v1.0.0-beta.22` toolchain.
- The in-browser reputation model (`lib/domain/trust-score.ts`) is bit-for-bit
  identical to `trust_score_proof`; divergence would let a holder prove a score
  they did not compute. This is guarded by shared test vectors.
- Source attestation verification inside the circuit is required for production
  and is not implemented in the demo (inputs are self-asserted).

## Soroban assumptions

- The verifier role faithfully verifies UltraHonk proofs until native on-chain
  verification (rs-soroban-ultrahonk) is integrated. That integration fixes the
  verification key at deploy time, generates proofs with `--oracle_hash keccak`
  to match Soroban's native Keccak-256, and verifies BN254 pairings through the
  Protocol 25 host functions (`g1_add`/`g1_mul`/`pairing_check`) to stay within
  the per-transaction instruction budget. Until then the verifier→registry path
  is authorized by an explicit verifier role rather than an in-circuit check.
- Checks-effects-interactions ordering holds for nullifier consumption.
- Admin operations (pause, verifier rotation, revocation) are protected by
  `require_auth` and, in production, multisig.

## Demo limitations

The deployed demo is a vertical slice. Specifically:

- Browser-side UltraHonk proof generation and the Soroban verification round-trip
  are **simulated**; the SHA-256 commitments are real but the proof bytes and
  Testnet submission are not. The UI labels every simulated value "(simulated)".
- Contract IDs are placeholders until deployment; ledger sequence and transaction
  hash are deterministic simulations.
- Inputs are self-asserted — there is no source attestation in the demo.
- The reputation model is illustrative ("Demo Reputation Model"), not a credit score.

## Future production security

- Replace simulation with real Noir + UltraHonk proving and the on-chain
  UltraHonk verifier; deploy verifier + registry to Testnet/Mainnet.
- Add signed source attestations and an independently operated verifier quorum.
- External circuit and contract audits; hardware-backed key ceremonies.
- See the threat table below for the full target control set.

## Threats and controls

| Threat | Control |
| --- | --- |
| Forged witness | Source attestation checks inside the circuit |
| Field overflow | Explicit unsigned integer types and range constraints |
| Policy substitution | Policy and circuit version bound into public commitment |
| Proof replay | Unique domain-separated nullifier consumed atomically on Soroban |
| Cross-chain replay | Network passphrase and contract address in receipt domain |
| Receipt forgery | Rotatable threshold-authorized verifier keys |
| Stale credentials | Source epoch and receipt/claim expiry checks |
| Front-running | Holder address binding and Soroban authorization |
| Correlation | Per-policy nullifiers and optional pairwise holder addresses |
| Database leak | Metadata-only schema, encryption, retention and log redaction |
| Admin compromise | Multisig administration, pause, delayed rotation and audit events |
| Malicious UI | Reproducible circuit artifacts and displayed policy/circuit hashes |

## Verification process

1. Decode proof and public inputs with strict length and canonicality checks.
2. Resolve an active policy and exact circuit verification key by commitment.
3. Verify the proof with Barretenberg under CPU/memory/time limits.
4. Confirm result, holder binding, source epoch, policy and expiry.
5. Construct a canonical domain-separated receipt.
6. Gather authorized verifier signatures and submit to Soroban.
7. Contract checks authorization, expiry and unused nullifier, then records claim.

## Contract security

- Checks-effects-interactions ordering for nullifier consumption.
- One passport per holder; credentials are non-transferable.
- Least-privilege verifier/issuer/admin roles with key rotation.
- Pause affects new verification, not read access or revocation.
- Bounded collections and storage TTL extension policy.
- Events contain commitments and identifiers only.
- Property tests cover duplicate nullifiers, expiration and unauthorized calls.

## Operational requirements

- External circuit and Soroban audits before production.
- At least two independent verifier implementations/operators.
- Hardware-backed issuer/verifier keys and documented key ceremonies.
- Rate limits, proof-size caps, queue isolation and denial-of-service monitoring.
- Incident procedures for verifier rotation, policy suspension and claim revocation.
- Data protection review for each launch jurisdiction.

## Non-goals

ForgePass is not a credit bureau, identity provider or automatic lending decision.
It proves policy predicates over attested inputs. Partners remain responsible for
fair-lending, consumer protection, KYC/AML and adverse-action obligations.

