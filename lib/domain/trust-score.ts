export const SCORE_VERSION = "forgepass-score-v1" as const;

export type TrustInputs = {
  monthlyIncomeUsd: number;
  averageBalanceUsd: number;
  accountAgeMonths: number;
  eligibleTransactions: number;
  consistentMonths: number;
  observedMonths: number;
};

export type ScoreBreakdown = {
  income: number;
  balance: number;
  accountAge: number;
  activity: number;
  consistency: number;
  total: number;
  version: typeof SCORE_VERSION;
};

const assertInteger = (name: string, value: number, max: number) => {
  if (!Number.isSafeInteger(value) || value < 0 || value > max) {
    throw new RangeError(`${name} must be an integer between 0 and ${max}`);
  }
};

const cappedPoints = (value: number, points: number, target: number) =>
  Math.min(Math.floor((value * points) / target), points);

export function calculateTrustScore(inputs: TrustInputs): ScoreBreakdown {
  assertInteger("monthlyIncomeUsd", inputs.monthlyIncomeUsd, 1_000_000);
  assertInteger("averageBalanceUsd", inputs.averageBalanceUsd, 10_000_000);
  assertInteger("accountAgeMonths", inputs.accountAgeMonths, 1_200);
  assertInteger("eligibleTransactions", inputs.eligibleTransactions, 1_000_000);
  assertInteger("consistentMonths", inputs.consistentMonths, 1_200);
  assertInteger("observedMonths", inputs.observedMonths, 1_200);

  if (inputs.observedMonths === 0 || inputs.consistentMonths > inputs.observedMonths) {
    throw new RangeError("observedMonths must be positive and at least consistentMonths");
  }

  const income = cappedPoints(inputs.monthlyIncomeUsd, 25, 8_000);
  const balance = cappedPoints(inputs.averageBalanceUsd, 20, 3_000);
  const accountAge = cappedPoints(inputs.accountAgeMonths, 20, 24);
  const activity = cappedPoints(inputs.eligibleTransactions, 20, 120);
  const consistency = Math.min(
    Math.floor((inputs.consistentMonths * 15) / inputs.observedMonths),
    15,
  );

  return {
    income,
    balance,
    accountAge,
    activity,
    consistency,
    total: income + balance + accountAge + activity + consistency,
    version: SCORE_VERSION,
  };
}

export const DEMO_INPUTS: TrustInputs = {
  monthlyIncomeUsd: 8_000,
  averageBalanceUsd: 3_000,
  accountAgeMonths: 18,
  eligibleTransactions: 120,
  consistentMonths: 9,
  observedMonths: 12,
};
