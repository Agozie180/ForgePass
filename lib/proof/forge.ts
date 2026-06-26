import { CONTRACTS, STELLAR_NETWORK } from "@/lib/stellar/config";
import type { Policy } from "@/lib/domain/policies";
import type { ScoreBreakdown, TrustInputs } from "@/lib/domain/trust-score";

/**
 * Shared proof metadata helpers. Browser UltraHonk generation lives in
 * browser-ultrahonk.ts; this module keeps privacy-preserving commitments,
 * nullifier derivation, and verification-record shaping used by the UI/tests.
 */
export const PROOF_SYSTEM = "Noir + UltraHonk" as const;

const BN254_FIELD_MODULUS = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");

export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return bytesToHex(new Uint8Array(digest));
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (clean.length % 2 !== 0) throw new Error("Hex input must have an even length.");
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i += 1) bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}

export function concatFieldBytes(fields: string[]): Uint8Array {
  const out = new Uint8Array(fields.length * 32);
  fields.forEach((field, index) => {
    const bytes = hexToBytes(field);
    if (bytes.length !== 32) throw new Error("UltraHonk public inputs must be 32-byte fields.");
    out.set(bytes, index * 32);
  });
  return out;
}

export async function fieldHexFromString(input: string): Promise<string> {
  const digest = await sha256Hex(input);
  const value = BigInt(`0x${digest}`) % BN254_FIELD_MODULUS;
  const nonZero = value === BigInt(0) ? BigInt(1) : value;
  return nonZero.toString(16).padStart(64, "0");
}

export function toCircuitField(hex: string): string {
  return hex.startsWith("0x") ? hex : `0x${hex}`;
}

export type ProofEnvelope = {
  proofSystem: typeof PROOF_SYSTEM;
  /** Commitment to the public inputs (policy, threshold, qualified flag). */
  publicInputsCommitment: string;
  /** Binds the proof to one holder so it cannot be reused by another wallet. */
  holderBinding: string;
  /** One-time-use tag enforcing on-chain replay protection. */
  nullifier: string;
  /** Commitment to the UltraHonk proof bytes or deterministic metadata. */
  proofCommitment: string;
  proofKind?: "metadata" | "browser-ultrahonk";
  proofBytesHex?: string;
  proofSizeBytes?: number;
  publicInputs?: string[];
  publicInputsBytesHex?: string;
  localVerification?: true;
};

export type VerificationRecord = {
  status:
    | "Scaffolded"
    | "Browser UltraHonk proof generated"
    | "Native UltraHonk verified on-chain"
    | "Native UltraHonk milestone verified";
  network: string;
  networkPassphrase: string;
  holder: string;
  /** ISO timestamp the record was assembled. */
  timestamp: string;
  /** Ledger sequence - simulated unless a real submission occurred. */
  ledger: number;
  /** Soroban transaction hash - simulated unless a real submission occurred. */
  txHash: string;
  verifierContract: string;
  registryContract: string;
  explorer: string;
  /** True only after a real proof transaction is submitted. Contract links can be live while this remains false. */
  onChain: boolean;
  /** True when the UI continues with the real deployed milestone proof instead of a fresh browser proof. */
  milestoneMode?: boolean;
};

/**
 * Derive a metadata-only proof envelope from public policy data + a holder.
 * Used by tests and Demo Mode fallback metadata; real proving is in browser-ultrahonk.ts.
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
    status: envelope.proofKind === "browser-ultrahonk" ? "Browser UltraHonk proof generated" : "Scaffolded",
    network: STELLAR_NETWORK.name,
    networkPassphrase: STELLAR_NETWORK.passphrase,
    holder,
    timestamp: nowIso,
    ledger,
    txHash,
    verifierContract: CONTRACTS.verifier,
    registryContract: CONTRACTS.registry,
    explorer: STELLAR_NETWORK.explorer,
    onChain: false,
  };
}

export function shortHash(hash: string, lead = 6, tail = 4): string {
  const h = hash.startsWith("0x") ? hash : `0x${hash}`;
  return `${h.slice(0, lead)}…${h.slice(-tail)}`;
}

/** A credential id derived from the proof - stable, contains no private data. */
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
