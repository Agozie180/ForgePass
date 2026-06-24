import { describe, expect, it } from "vitest";
import { calculateTrustScore, DEMO_INPUTS, type TrustInputs } from "./trust-score";

/**
 * Circuit parity guard.
 *
 * `circuitScore` re-implements the EXACT integer arithmetic of the Noir flagship
 * circuit `circuits/trust_score_proof/src/main.nr`, independently of the product
 * code in `trust-score.ts`. If the two ever diverge, a holder could prove a score
 * they did not compute (see docs/SECURITY.md → "Noir / circuit assumptions"), so
 * this test is the executable form of the bit-for-bit lockstep claim.
 *
 * Noir `capped_points(value, points, target) = min(value * points / target, points)`
 * with u64 floor division. The flagship circuit does NOT cap consistency
 * explicitly — but because it asserts `consistent_months <= observed_months`,
 * `consistent * 15 / observed <= 15` always holds, so the product `trust-score.ts`
 * cap is observationally identical on the circuit's valid domain.
 */
function circuitScore(i: TrustInputs): number {
  const capped = (value: number, points: number, target: number) =>
    Math.min(Math.floor((value * points) / target), points);
  const income = capped(i.monthlyIncomeUsd, 25, 8_000);
  const balance = capped(i.averageBalanceUsd, 20, 3_000);
  const age = capped(i.accountAgeMonths, 20, 24);
  const activity = capped(i.eligibleTransactions, 20, 120);
  const consistency = Math.floor((i.consistentMonths * 15) / i.observedMonths);
  return income + balance + age + activity + consistency;
}

// A deterministic grid of representative witnesses spanning below-target,
// at-target, and above-target (cap-triggering) magnitudes for every component.
const INCOMES = [0, 2_000, 8_000, 20_000];
const BALANCES = [0, 1_500, 3_000, 12_000];
const AGES = [0, 12, 24, 96];
const TXS = [0, 60, 120, 400];
const CONSISTENCY = [
  { consistentMonths: 0, observedMonths: 12 },
  { consistentMonths: 6, observedMonths: 12 },
  { consistentMonths: 9, observedMonths: 12 },
  { consistentMonths: 12, observedMonths: 12 },
  { consistentMonths: 5, observedMonths: 7 },
];

describe("trust-score ↔ Noir circuit parity", () => {
  it("matches the circuit arithmetic across the full witness grid", () => {
    let checked = 0;
    for (const monthlyIncomeUsd of INCOMES)
      for (const averageBalanceUsd of BALANCES)
        for (const accountAgeMonths of AGES)
          for (const eligibleTransactions of TXS)
            for (const c of CONSISTENCY) {
              const inputs: TrustInputs = {
                monthlyIncomeUsd,
                averageBalanceUsd,
                accountAgeMonths,
                eligibleTransactions,
                consistentMonths: c.consistentMonths,
                observedMonths: c.observedMonths,
              };
              const ts = calculateTrustScore(inputs).total;
              expect(ts, JSON.stringify(inputs)).toBe(circuitScore(inputs));
              expect(ts).toBeGreaterThanOrEqual(0);
              expect(ts).toBeLessThanOrEqual(100);
              checked += 1;
            }
    expect(checked).toBe(
      INCOMES.length * BALANCES.length * AGES.length * TXS.length * CONSISTENCY.length,
    );
  });

  it("matches the circuit's canonical demo vector (score 91)", () => {
    // Mirrors the `demo_score_qualifies` Noir test: 8000,3000,18,120,9,12.
    expect(calculateTrustScore(DEMO_INPUTS).total).toBe(91);
    expect(circuitScore(DEMO_INPUTS)).toBe(91);
  });

  it("never lets a single component exceed its weight", () => {
    const maxed = calculateTrustScore({
      monthlyIncomeUsd: 1_000_000,
      averageBalanceUsd: 10_000_000,
      accountAgeMonths: 1_200,
      eligibleTransactions: 1_000_000,
      consistentMonths: 12,
      observedMonths: 12,
    });
    expect(maxed.income).toBe(25);
    expect(maxed.balance).toBe(20);
    expect(maxed.accountAge).toBe(20);
    expect(maxed.activity).toBe(20);
    expect(maxed.consistency).toBe(15);
    expect(maxed.total).toBe(100);
  });
});
