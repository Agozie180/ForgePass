import { CONTRACTS, HAS_LIVE_CONTRACTS, STELLAR_NETWORK } from "@/lib/stellar/config";
import type { Policy } from "@/lib/domain/policies";
import type { ScoreBreakdown, TrustInputs } from "@/lib/domain/trust-score";

/**
 * ForgePass proof layer.
 *
 * What is REAL here: the SHA-256 commitments and the holder-bound nullifier are
 * computed with the Web Crypto API over the *public* inputs only. No private
 * value is ever hashed in a way that could be inverted to recover it, and no
 * private value is included in the returned envelope.
 *
 * What is SIMULATED here: the UltraHonk proving + on-chain Soroban verification
 * round-trip. The Noir circuits (circuits/) and the Soroban verifier
 * (contracts/) are real and compiled, but generating a browser-side UltraHonk
 * proof and submitting a Testnet transaction is out of scope for the demo. The
 * UI labels every simulated value. See docs/SECURITY.md.
 */
export const PROOF_SYSTEM = "Noir + UltraHonk" as const;

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export type ProofEnvelope = {
  proofSystem: typeof PROOF_SYSTEM;
  /** Commitment to the public inputs (policy, threshold, qualified flag). */
  publicInputsCommitment: string;
  /** Binds the proof to one holder so it cannot be reused by another wallet. */
  holderBinding: string;
  /** One-time-use tag enforcing on-chain replay protection. */
  nullifier: string;
  /** Commitment standing in for the UltraHonk proof bytes (simulated). */
  proofCommitment: string;
};

export type VerificationRecord = {
  status: "Verified";
  network: string;
  networkPassphrase: string;
  holder: string;
  /** ISO timestamp the record was assembled. */
  timestamp: string;
  /** Ledger sequence — simulated unless a real submission occurred. */
  ledger: number;
  /** Soroban transaction hash — simulated unless a real submission occurred. */
  txHash: string;
  verifierContract: string;
  registryContract: string;
  explorer: string;
  /** True only when real on-chain contracts + submission are wired. */
  onChain: boolean;
};

/**
 * Derive the proof envelope from public policy data + a holder identifier.
 * Only public values are hashed; private inputs are intentionally excluded.
 */
export async function forgeProof(
  policy: Policy,
  score: ScoreBreakdown,
  holder: string,
): Promise<ProofEnvelope> {
  const qualified = score.total > policy.scoreThreshold;
  const domain = `forgepass|${score.version}|${policy.id}|${policy.scoreThreshold}|${qualified}`;
  const holderBinding = await sha256Hex(`holder|${holder}|${policy.commitment}`);
  const nullifier = await sha256Hex(`nullifier|${holder}|${policy.id}|${score.version}`);
  const publicInputsCommitment = await sha256Hex(`${domain}|${policy.commitment}`);
  const proofCommitment = await sha256Hex(`${domain}|${holderBinding}|${nullifier}`);
  return {
    proofSystem: PROOF_SYSTEM,
    publicInputsCommitment,
    holderBinding,
    nullifier,
    proofCommitment,
  };
}

/** Assemble the Stellar verification record shown in the verification panel. */
export async function buildVerificationRecord(
  envelope: ProofEnvelope,
  holder: string,
  nowIso: string,
): Promise<VerificationRecord> {
  const seed = parseInt(envelope.proofCommitment.slice(0, 12), 16);
  const ledger = 14_800_000 + (seed % 200_000);
  const txHash = await sha256Hex(`tx|${envelope.proofCommitment}|${nowIso}`);
  return {
    status: "Verified",
    network: STELLAR_NETWORK.name,
    networkPassphrase: STELLAR_NETWORK.passphrase,
    holder,
    timestamp: nowIso,
    ledger,
    txHash,
    verifierContract: CONTRACTS.verifier,
    registryContract: CONTRACTS.registry,
    explorer: STELLAR_NETWORK.explorer,
    onChain: HAS_LIVE_CONTRACTS,
  };
}

export function shortHash(hash: string, lead = 6, tail = 4): string {
  const h = hash.startsWith("0x") ? hash : `0x${hash}`;
  return `${h.slice(0, lead)}…${h.slice(-tail)}`;
}

/** A credential id derived from the proof — stable, contains no private data. */
export function credentialId(envelope: ProofEnvelope): string {
  return `FP-${envelope.proofCommitment.slice(0, 8).toUpperCase()}`;
}

export type ForgeInputsCheck = { ok: true } | { ok: false; reason: string };

/** Lightweight guard the UI uses before proving (mirrors circuit asserts). */
export function checkInputs(inputs: TrustInputs): ForgeInputsCheck {
  if (inputs.observedMonths <= 0) return { ok: false, reason: "Observed months must be positive" };
  if (inputs.consistentMonths > inputs.observedMonths)
    return { ok: false, reason: "Consistent months cannot exceed observed months" };
  return { ok: true };
}
