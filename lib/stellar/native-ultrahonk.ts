import { Buffer } from "buffer";
import { BASE_FEE, Contract, TransactionBuilder, rpc, xdr } from "@stellar/stellar-sdk";
import { CONTRACTS, STELLAR_NETWORK } from "@/lib/stellar/config";
import { hexToBytes, type ProofEnvelope } from "@/lib/proof/forge";
import { signFreighterTransaction } from "@/lib/wallet/freighter";

export type NativeUltraHonkSubmission = {
  hash: string;
  latestLedger?: number;
};

type SorobanRpcResponse<T> = {
  jsonrpc: string;
  id: string;
  result?: T;
  error?: { code: number; message: string; data?: unknown };
};

type RawSendTransactionResult = {
  status: "PENDING" | "DUPLICATE" | "TRY_AGAIN_LATER" | "ERROR";
  hash: string;
  latestLedger?: number;
  errorResultXdr?: string;
  diagnosticEventsXdr?: string[];
};

type RawGetTransactionResult = {
  status: "NOT_FOUND" | "SUCCESS" | "FAILED";
  latestLedger?: number;
  resultXdr?: string;
  resultMetaXdr?: string;
};

function proofBytesScVal(hex: string): xdr.ScVal {
  return xdr.ScVal.scvBytes(Buffer.from(hexToBytes(hex)));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function sorobanRpc<T>(method: string, params: Record<string, unknown>): Promise<T> {
  const response = await fetch(STELLAR_NETWORK.rpc, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: `forgepass-${method}`, method, params }),
  });
  if (!response.ok) throw new Error(`Soroban RPC ${method} failed with HTTP ${response.status}.`);

  const payload = (await response.json()) as SorobanRpcResponse<T>;
  if (payload.error) {
    throw new Error(`Soroban RPC ${method} error ${payload.error.code}: ${payload.error.message}`);
  }
  if (!payload.result) throw new Error(`Soroban RPC ${method} returned no result.`);
  return payload.result;
}

async function sendSignedTransactionXdr(signedXdr: string): Promise<RawSendTransactionResult> {
  return sorobanRpc<RawSendTransactionResult>("sendTransaction", { transaction: signedXdr });
}

async function waitForTransaction(hash: string): Promise<RawGetTransactionResult> {
  let last: RawGetTransactionResult | null = null;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    last = await sorobanRpc<RawGetTransactionResult>("getTransaction", { hash });
    if (last.status !== "NOT_FOUND") return last;
    await sleep(1000);
  }
  throw new Error(`Native UltraHonk transaction was submitted but not found after polling: ${hash}`);
}

export async function submitNativeUltraHonkProof(
  envelope: ProofEnvelope,
  holder: string,
): Promise<NativeUltraHonkSubmission> {
  if (!CONTRACTS.nativeUltraHonkVerifier) throw new Error("Native UltraHonk verifier contract ID is not configured.");
  if (!envelope.proofBytesHex || !envelope.publicInputsBytesHex) {
    throw new Error("A real UltraHonk proof is required before submitting to Stellar Testnet.");
  }

  const server = new rpc.Server(STELLAR_NETWORK.rpc, { allowHttp: false });
  const source = await server.getAccount(holder);
  const contract = new Contract(CONTRACTS.nativeUltraHonkVerifier);
  const raw = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: STELLAR_NETWORK.passphrase,
  })
    .addOperation(contract.call(
      "verify_proof",
      proofBytesScVal(envelope.publicInputsBytesHex),
      proofBytesScVal(envelope.proofBytesHex),
    ))
    .setTimeout(180)
    .build();

  const prepared = await server.prepareTransaction(raw);
  const signedXdr = await signFreighterTransaction(prepared.toXDR(), STELLAR_NETWORK.passphrase, holder);
  const sent = await sendSignedTransactionXdr(signedXdr);

  if (sent.status === "ERROR") {
    const detail = sent.errorResultXdr ? ` errorResultXdr=${sent.errorResultXdr}` : "";
    throw new Error(`Stellar RPC rejected the native UltraHonk transaction.${detail}`);
  }
  if (sent.status === "TRY_AGAIN_LATER") {
    throw new Error("Stellar RPC asked to try the native UltraHonk transaction again later.");
  }

  const result = await waitForTransaction(sent.hash);
  if (result.status !== "SUCCESS") {
    throw new Error(`Native UltraHonk transaction did not succeed: ${result.status}`);
  }

  return { hash: sent.hash, latestLedger: result.latestLedger ?? sent.latestLedger };
}