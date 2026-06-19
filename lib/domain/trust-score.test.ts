import { describe, expect, it } from "vitest";
import { calculateTrustScore, DEMO_INPUTS } from "./trust-score";

describe("calculateTrustScore", () => {
  it("produces the canonical demo score", () => {
    expect(calculateTrustScore(DEMO_INPUTS).total).toBe(91);
  });

  it("caps every component and the total", () => {
    const score = calculateTrustScore({
      monthlyIncomeUsd: 1_000_000,
      averageBalanceUsd: 10_000_000,
      accountAgeMonths: 1_200,
      eligibleTransactions: 1_000_000,
      consistentMonths: 12,
      observedMonths: 12,
    });
    expect(score.total).toBe(100);
  });

  it("rejects unsafe or inconsistent witnesses", () => {
    expect(() =>
      calculateTrustScore({ ...DEMO_INPUTS, consistentMonths: 13 }),
    ).toThrow(RangeError);
    expect(() =>
      calculateTrustScore({ ...DEMO_INPUTS, monthlyIncomeUsd: -1 }),
    ).toThrow(RangeError);
  });
});
