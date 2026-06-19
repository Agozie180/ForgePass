# ForgePass Security Model

## Protected assets

- Raw income, balance, account-age and transaction data.
- The exact Trust Score and its component scores.
- Holder secrets, source credentials and proof witnesses.
- Integrity and non-transferability of passport claims.
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

