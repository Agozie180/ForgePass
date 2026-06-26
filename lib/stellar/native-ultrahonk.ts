import { Buffer } from "buffer";
import { BASE_FEE, Contract, TransactionBuilder, rpc, xdr } from "@stellar/stellar-sdk";
import { CONTRACTS, STELLAR_NETWORK } from "@/lib/stellar/config";
import { hexToBytes, type ProofEnvelope } from "@/lib/proof/forge";
import { signFreighterTransaction } from "@/lib/wallet/freighter";

export type NativeUltraHonkSubmission = {
  hash: string;
  latestLedger?: number;
};

function proofBytesScVal(hex: string): xdr.ScVal {
  return xdr.ScVal.scvBytes(Buffer.from(hexToBytes(hex)));
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
  const signed = TransactionBuilder.fromXDR(signedXdr, STELLAR_NETWORK.passphrase);
  const sent = await server.sendTransaction(signed);
  if (sent.status === "ERROR") throw new Error(sent.errorResult ? sent.errorResult.toXDR("base64") : "Stellar RPC rejected the native UltraHonk transaction.");

  const hash = sent.hash;
  const result = await server.pollTransaction(hash, { attempts: 30, sleepStrategy: rpc.LinearSleepStrategy });
  if (result.status !== "SUCCESS") throw new Error(`Native UltraHonk transaction did not succeed: ${result.status}`);

  return { hash, latestLedger: "latestLedger" in result ? result.latestLedger : undefined };
}