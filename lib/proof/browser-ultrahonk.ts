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

export type BrowserUltraHonkProgress = (message: string) => void;

const devLog = (...args: unknown[]) => {
  if (process.env.NODE_ENV !== "production") console.info("[ForgePass UltraHonk]", ...args);
};

function describeError(error: unknown): string {
  if (error instanceof Error) return error.message || error.name;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown browser UltraHonk error";
  }
}

function assertBrowserSupport() {
  if (typeof window === "undefined") throw new Error("Browser UltraHonk proving must run in a browser context.");
  if (typeof WebAssembly === "undefined") throw new Error("WebAssembly is not available in this browser.");
  if (!crypto?.subtle) throw new Error("Web Crypto subtle API is not available in this browser.");
}

function assertCircuitArtifact(compiled: CompiledCircuit) {
  if (!compiled || typeof compiled !== "object") throw new Error("trust_score_proof ACIR artifact did not load.");
  if (!compiled.bytecode || typeof compiled.bytecode !== "string") {
    throw new Error("trust_score_proof ACIR artifact is missing bytecode.");
  }
  if (!compiled.abi) throw new Error("trust_score_proof ACIR artifact is missing ABI metadata.");
}

async function phase<T>(label: string, onProgress: BrowserUltraHonkProgress | undefined, task: () => Promise<T>): Promise<T> {
  onProgress?.(label);
  devLog(label);
  try {
    return await task();
  } catch (error) {
    throw new Error(`${label} failed: ${describeError(error)}`);
  }
}

export async function generateBrowserUltraHonkProof(
  policy: Policy,
  score: ScoreBreakdown,
  inputs: TrustInputs,
  holder: string,
  onProgress?: BrowserUltraHonkProgress,
): Promise<BrowserUltraHonkEnvelope> {
  const qualified = score.total > policy.scoreThreshold;
  if (!qualified) throw new Error(`Cannot prove ${policy.name}: score does not beat ${policy.scoreThreshold}.`);

  assertBrowserSupport();
  const compiled = circuit as CompiledCircuit;
  assertCircuitArtifact(compiled);
  devLog("ACIR artifact loaded", { bytecodeLength: compiled.bytecode.length });

  const [{ Noir }, { UltraHonkBackend }] = await phase("Loading NoirJS and Barretenberg", onProgress, async () => Promise.all([
    import("@noir-lang/noir_js"),
    import("@aztec/bb.js"),
  ]));

  const { policyCommitment, holderBinding, nullifier } = await phase("Deriving public inputs", onProgress, async () => ({
    policyCommitment: await fieldHexFromString(`policy|${policy.id}|${policy.commitment}`),
    holderBinding: await fieldHexFromString(`holder|${holder}|${policy.commitment}`),
    nullifier: await fieldHexFromString(
      `nullifier|${holder}|${policy.id}|${score.version}|${STELLAR_NETWORK.passphrase}|${CONTRACTS.nativeUltraHonkVerifier || CONTRACTS.verifier}`,
    ),
  }));

  const noir = new Noir(compiled);
  await phase("Initializing Noir circuit", onProgress, async () => {
    if (typeof noir.init === "function") await noir.init();
  });

  const { witness } = await phase("Generating Noir witness", onProgress, async () => noir.execute({
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
  }));

  const backend = new UltraHonkBackend(compiled.bytecode, { threads: 1 });
  try {
    const proofData = await phase("Generating UltraHonk proof", onProgress, async () => backend.generateProof(witness, { keccak: true }));
    const localVerification = await phase("Locally verifying UltraHonk proof", onProgress, async () => backend.verifyProof(proofData, { keccak: true }));
    if (!localVerification) throw new Error("UltraHonk proof failed local verification.");

    return await phase("Encoding proof for Soroban verify_proof", onProgress, async () => {
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
    });
  } finally {
    await backend.destroy();
  }
}
