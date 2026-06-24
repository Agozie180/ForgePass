import { describe, expect, it } from "vitest";
import { calculateTrustScore, type TrustInputs } from "./trust-score";
import { deriveClaims, getPolicy, POLICIES } from "./policies";

/**
 * Threshold semantics are exclusive: the predicate proven is `score > threshold`,
 * matching `assert(qualified == (score > threshold))` in the Noir circuit. A score
 * landing exactly on the threshold must NOT qualify — this guards against an
 * off-by-one that would let a sub-threshold holder claim eligibility.
 */

// Income 25 + balance 20 + age 20 + activity 0 + consistency 15 = exactly 80.
const SCORE_80: TrustInputs = {
  monthlyIncomeUsd: 8_000,
  averageBalanceUsd: 3_000,
  accountAgeMonths: 24,
  eligibleTransactions: 0,
  consistentMonths: 12,
  observedMonths: 12,
};

describe("policy threshold boundary", () => {
  it("scores exactly on the Prime Access threshold (80)", () => {
    expect(calculateTrustScore(SCORE_80).total).toBe(80);
  });

  it("does not qualify when score equals the threshold (strict >)", () => {
    const policy = getPolicy("prime-access"); // scoreThreshold = 80
    const score = calculateTrustScore(SCORE_80);
    const reputation = deriveClaims(SCORE_80, score, policy).find((c) => c.key === "reputation");
    expect(reputation?.satisfied).toBe(false);
  });

  it("qualifies one point above the threshold", () => {
    const policy = getPolicy("prime-access");
    const above: TrustInputs = { ...SCORE_80, eligibleTransactions: 6 }; // +1 activity point → 81
    const score = calculateTrustScore(above);
    expect(score.total).toBe(81);
    const reputation = deriveClaims(above, score, policy).find((c) => c.key === "reputation");
    expect(reputation?.satisfied).toBe(true);
  });

  it("each policy commitment is unique and non-empty", () => {
    const commitments = POLICIES.map((p) => p.commitment);
    expect(new Set(commitments).size).toBe(POLICIES.length);
    expect(commitments.every((c) => c.length > 0)).toBe(true);
  });

  it("threshold claims read the raw inputs, not the score", () => {
    // Below score threshold overall, but income alone still clears the income tier.
    const inputs: TrustInputs = { ...SCORE_80, monthlyIncomeUsd: 6_000, averageBalanceUsd: 0, consistentMonths: 0 };
    const policy = getPolicy("prime-access"); // income threshold 5_000
    const score = calculateTrustScore(inputs);
    const claims = deriveClaims(inputs, score, policy);
    expect(claims.find((c) => c.key === "income")?.satisfied).toBe(true);
    expect(claims.find((c) => c.key === "balance")?.satisfied).toBe(false);
  });
});
