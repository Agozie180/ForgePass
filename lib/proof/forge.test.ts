import { describe, expect, it } from "vitest";
import { calculateTrustScore, DEMO_INPUTS } from "@/lib/domain/trust-score";
import { getPolicy } from "@/lib/domain/policies";
import { buildVerificationRecord, checkInputs, credentialId, forgeProof } from "./forge";

const HOLDER = "GD7KFORGEPASSTESTHOLDERXXXXXXXXXXXXXXXXXXXXXXXXXXVQ2M";

describe("forgeProof", () => {
  it("is deterministic for the same holder + policy + score", async () => {
    const score = calculateTrustScore(DEMO_INPUTS);
    const policy = getPolicy("prime-access");
    const a = await forgeProof(policy, score, HOLDER);
    const b = await forgeProof(policy, score, HOLDER);
    expect(a).toEqual(b);
    expect(a.proofCommitment).toMatch(/^[0-9a-f]{64}$/);
  });

  it("binds the proof to the holder (different wallet => different binding)", async () => {
    const score = calculateTrustScore(DEMO_INPUTS);
    const policy = getPolicy("prime-access");
    const a = await forgeProof(policy, score, HOLDER);
    const b = await forgeProof(policy, score, `${HOLDER}OTHER`);
    expect(a.holderBinding).not.toEqual(b.holderBinding);
    expect(a.nullifier).not.toEqual(b.nullifier);
  });

  it("exposes only public commitment fields (no raw inputs)", async () => {
    const score = calculateTrustScore(DEMO_INPUTS);
    const env = await forgeProof(getPolicy("prime-access"), score, HOLDER);
    expect(Object.keys(env).sort()).toEqual(
      ["holderBinding", "nullifier", "proofCommitment", "proofSystem", "publicInputsCommitment"],
    );
    // Every commitment is an opaque 32-byte hash, not a recoverable value.
    for (const field of ["holderBinding", "nullifier", "proofCommitment", "publicInputsCommitment"] as const) {
      expect(env[field]).toMatch(/^[0-9a-f]{64}$/);
    }
    // The distinctive private magnitudes never appear verbatim.
    const blob = JSON.stringify(env);
    expect(blob.includes(String(DEMO_INPUTS.monthlyIncomeUsd))).toBe(false);
    expect(blob.includes(String(DEMO_INPUTS.averageBalanceUsd))).toBe(false);
  });

  it("produces a stable credential id and verification record", async () => {
    const score = calculateTrustScore(DEMO_INPUTS);
    const env = await forgeProof(getPolicy("prime-access"), score, HOLDER);
    expect(credentialId(env)).toMatch(/^FP-[0-9A-F]{8}$/);
    const rec = await buildVerificationRecord(env, HOLDER, "2026-01-01T00:00:00.000Z");
    expect(rec.status).toBe("Verified");
    expect(rec.txHash).toMatch(/^[0-9a-f]{64}$/);
    expect(rec.holder).toBe(HOLDER);
  });
});

describe("checkInputs", () => {
  it("accepts the demo inputs", () => {
    expect(checkInputs(DEMO_INPUTS).ok).toBe(true);
  });
  it("rejects consistent months greater than observed months", () => {
    const res = checkInputs({ ...DEMO_INPUTS, consistentMonths: 13, observedMonths: 12 });
    expect(res.ok).toBe(false);
  });
});
