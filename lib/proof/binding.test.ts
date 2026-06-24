import { describe, expect, it } from "vitest";
import { calculateTrustScore, DEMO_INPUTS } from "@/lib/domain/trust-score";
import { getPolicy, POLICIES } from "@/lib/domain/policies";
import { forgeProof } from "./forge";

const HOLDER = "GD7KFORGEPASSTESTHOLDERXXXXXXXXXXXXXXXXXXXXXXXXXXVQ2M";

/**
 * Replay protection lives in the nullifier domain (see docs/SECURITY.md →
 * "Replay protection strategy"). These tests pin the cross-cutting properties the
 * `ForgePassVerifier` contract relies on: nullifiers are per-(holder, policy), and
 * every public binding is a non-zero opaque hash the circuit can assert against.
 */
describe("proof bindings & nullifier domain separation", () => {
  it("derives a distinct nullifier per policy for the same holder", async () => {
    const score = calculateTrustScore(DEMO_INPUTS);
    const envelopes = await Promise.all(
      POLICIES.map((p) => forgeProof(p, score, HOLDER)),
    );
    const nullifiers = envelopes.map((e) => e.nullifier);
    expect(new Set(nullifiers).size).toBe(POLICIES.length);
  });

  it("changes the public-inputs commitment when the policy changes", async () => {
    const score = calculateTrustScore(DEMO_INPUTS);
    const a = await forgeProof(getPolicy("prime-access"), score, HOLDER);
    const b = await forgeProof(getPolicy("membership"), score, HOLDER);
    expect(a.publicInputsCommitment).not.toBe(b.publicInputsCommitment);
    expect(a.proofCommitment).not.toBe(b.proofCommitment);
  });

  it("emits only non-zero bindings (circuit asserts != 0)", async () => {
    const score = calculateTrustScore(DEMO_INPUTS);
    const env = await forgeProof(getPolicy("prime-access"), score, HOLDER);
    for (const field of ["holderBinding", "nullifier", "publicInputsCommitment", "proofCommitment"] as const) {
      expect(env[field]).toMatch(/^[0-9a-f]{64}$/);
      // Non-zero: at least one hex digit is not '0' (circuit asserts field != 0).
      expect(/[1-9a-f]/.test(env[field])).toBe(true);
    }
  });

  it("never leaks a private magnitude into any binding", async () => {
    const score = calculateTrustScore(DEMO_INPUTS);
    const env = await forgeProof(getPolicy("prime-access"), score, HOLDER);
    const blob = JSON.stringify(env);
    // Only the distinctive multi-digit magnitudes — short values like the score
    // (91) would collide with hex digits by chance and say nothing about leakage.
    for (const value of Object.values(DEMO_INPUTS)) {
      if (value >= 1000) expect(blob.includes(String(value))).toBe(false);
    }
  });
});
