import { describe, expect, it } from "vitest";
import { calculateTrustScore, DEMO_INPUTS } from "./trust-score";
import { deriveClaims, getPolicy, POLICIES } from "./policies";

describe("policies", () => {
  it("every policy weighting tier is internally ordered", () => {
    const thresholds = POLICIES.map((p) => p.scoreThreshold);
    expect(thresholds).toEqual([...thresholds].sort((a, b) => b - a));
  });

  it("derives satisfied claims for the qualifying demo holder", () => {
    const score = calculateTrustScore(DEMO_INPUTS);
    const claims = deriveClaims(DEMO_INPUTS, score, getPolicy("prime-access"));
    expect(claims).toHaveLength(5);
    expect(claims.every((c) => c.satisfied)).toBe(true);
    expect(claims[0].key).toBe("reputation");
  });

  it("marks reputation unsatisfied when the score is below the threshold", () => {
    const low = { ...DEMO_INPUTS, monthlyIncomeUsd: 500, averageBalanceUsd: 100, eligibleTransactions: 2 };
    const score = calculateTrustScore(low);
    const claims = deriveClaims(low, score, getPolicy("prime-access"));
    expect(claims.find((c) => c.key === "reputation")?.satisfied).toBe(false);
  });

  it("falls back to the first policy for unknown ids", () => {
    expect(getPolicy("does-not-exist").id).toBe(POLICIES[0].id);
  });
});
