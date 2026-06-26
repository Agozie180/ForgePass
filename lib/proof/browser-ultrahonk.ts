import circuit from "@/artifacts/noir/trust_score_proof.json";
import type { CompiledCircuit } from "@noir-lang/noir_js";
import type { Policy } from "@/lib/domain/policies";
import type { ScoreBreakdown, TrustInputs } from "@/lib/domain/trust-score";
import { CONTRACTS, STELLAR_NETWORK } from "@/lib/stellar/config";
import {
  PROOF_SYSTEM,
  bytesToHex,
  concatFieldBytes,
  fieldHexFromString,
  sha256Hex,
  toCircuitField,
  type ProofEnvelope,
} from "@/lib/proof/forge";

export type BrowserUltraHonkEnvelope = ProofEnvelope & {
  proofKind: "browser-ultrahonk";
  proofBytesHex: string;
  proofSizeBytes: number;
  publicInputs: string[];
  publicInputsBytesHex: string;
  localVerification: true;
};

export async function generateBrowserUltraHonkProof(
  policy: Policy,
  score: ScoreBreakdown,
  inputs: TrustInputs,
  holder: string,
): Promise<BrowserUltraHonkEnvelope> {
  const qualified = score.total > policy.scoreThreshold;
  if (!qualified) throw new Error(`Cannot prove ${policy.name}: score does not beat ${policy.scoreThreshold}.`);

  const [{ Noir }, { UltraHonkBackend }] = await Promise.all([
    import("@noir-lang/noir_js"),
    import("@aztec/bb.js"),
  ]);

  const policyCommitment = await fieldHexFromString(`policy|${policy.id}|${policy.commitment}`);
  const holderBinding = await fieldHexFromString(`holder|${holder}|${policy.commitment}`);
  const nullifier = await fieldHexFromString(
    `nullifier|${holder}|${policy.id}|${score.version}|${STELLAR_NETWORK.passphrase}|${CONTRACTS.nativeUltraHonkVerifier || CONTRACTS.verifier}`,
  );

  const compiled = circuit as CompiledCircuit;
  const noir = new Noir(compiled);
  await noir.init();

  const { witness } = await noir.execute({
    monthly_income_usd: inputs.monthlyIncomeUsd,
    average_balance_usd: inputs.averageBalanceUsd,
    account_age_months: inputs.accountAgeMonths,
    eligible_transactions: inputs.eligibleTransactions,
    consistent_months: inputs.consistentMonths,
    observed_months: inputs.observedMonths,
    threshold: policy.scoreThreshold,
    policy_commitment: toCircuitField(policyCommitment),
    holder_binding: toCircuitField(holderBinding),
    nullifier: toCircuitField(nullifier),
    qualified,
  });

  const backend = new UltraHonkBackend(compiled.bytecode, { threads: 1 });
  try {
    const proofData = await backend.generateProof(witness, { keccak: true });
    const localVerification = await backend.verifyProof(proofData, { keccak: true });
    if (!localVerification) throw new Error("UltraHonk proof failed local verification.");

    const proofBytesHex = bytesToHex(proofData.proof);
    const publicInputsBytesHex = bytesToHex(concatFieldBytes(proofData.publicInputs));
    const publicInputsCommitment = await sha256Hex(`public-inputs|${proofData.publicInputs.join("|")}`);
    const proofCommitment = await sha256Hex(`ultrahonk|${proofBytesHex}|${publicInputsCommitment}`);

    return {
      proofSystem: PROOF_SYSTEM,
      proofKind: "browser-ultrahonk",
      publicInputsCommitment,
      holderBinding,
      nullifier,
      proofCommitment,
      proofBytesHex,
      proofSizeBytes: proofData.proof.length,
      publicInputs: proofData.publicInputs,
      publicInputsBytesHex,
      localVerification: true,
    };
  } finally {
    await backend.destroy();
  }
}