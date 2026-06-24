import type { ScoreBreakdown, TrustInputs } from "./trust-score";

/**
 * A ForgePass policy is the public predicate a verifier asks for. The holder
 * proves they satisfy it without revealing any private value. Each policy lists
 * the individual threshold claims that the bundle of Noir circuits attests to.
 */
export type Policy = {
  id: string;
  /** Stable 32-byte-ish commitment label shown in receipts (hex, demo value). */
  commitment: string;
  name: string;
  summary: string;
  /** Minimum reputation score the holder must beat (exclusive). */
  scoreThreshold: number;
  thresholds: {
    incomeUsd: number;
    balanceUsd: number;
    accountAgeMonths: number;
    eligibleTransactions: number;
  };
};

export const POLICIES: Policy[] = [
  {
    id: "prime-access",
    commitment: "0xpolicy-prime-7f2a91c4",
    name: "Prime Access",
    summary: "Premium lending & financial products",
    scoreThreshold: 80,
    thresholds: { incomeUsd: 5_000, balanceUsd: 2_000, accountAgeMonths: 12, eligibleTransactions: 60 },
  },
  {
    id: "marketplace-trust",
    commitment: "0xpolicy-market-3bd8a120",
    name: "Marketplace Trust",
    summary: "Seller / freelancer reputation tier",
    scoreThreshold: 70,
    thresholds: { incomeUsd: 3_000, balanceUsd: 1_000, accountAgeMonths: 6, eligibleTransactions: 40 },
  },
  {
    id: "membership",
    commitment: "0xpolicy-member-91c47f2a",
    name: "Membership Eligibility",
    summary: "Gated community / DAO membership",
    scoreThreshold: 60,
    thresholds: { incomeUsd: 2_000, balanceUsd: 500, accountAgeMonths: 3, eligibleTransactions: 20 },
  },
];

export const DEFAULT_POLICY_ID = "prime-access";

export type ClaimKey =
  | "reputation"
  | "income"
  | "balance"
  | "accountAge"
  | "activity";

export type VerifiedClaim = {
  key: ClaimKey;
  label: string;
  satisfied: boolean;
};

/**
 * Derive the set of threshold claims a proof would attest to for a policy.
 * Only the booleans are ever revealed — never the underlying numbers.
 */
export function deriveClaims(
  inputs: TrustInputs,
  score: ScoreBreakdown,
  policy: Policy,
): VerifiedClaim[] {
  return [
    { key: "reputation", label: "Reputation qualified", satisfied: score.total > policy.scoreThreshold },
    { key: "income", label: "Income threshold verified", satisfied: inputs.monthlyIncomeUsd >= policy.thresholds.incomeUsd },
    { key: "balance", label: "Balance threshold verified", satisfied: inputs.averageBalanceUsd >= policy.thresholds.balanceUsd },
    { key: "accountAge", label: "Account age verified", satisfied: inputs.accountAgeMonths >= policy.thresholds.accountAgeMonths },
    { key: "activity", label: "Transaction activity verified", satisfied: inputs.eligibleTransactions >= policy.thresholds.eligibleTransactions },
  ];
}

export function getPolicy(id: string): Policy {
  return POLICIES.find((p) => p.id === id) ?? POLICIES[0];
}
