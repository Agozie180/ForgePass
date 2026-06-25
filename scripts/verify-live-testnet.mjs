import { existsSync, readFileSync } from "node:fs";
import { rpc, StrKey, xdr } from "@stellar/stellar-sdk";

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");
loadEnvFile(".env.example");

const network = process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "Testnet";
const rpcUrl = process.env.NEXT_PUBLIC_STELLAR_RPC_URL ?? "https://soroban-testnet.stellar.org";
const explorerBase = "https://stellar.expert/explorer/testnet";

const requiredContracts = [
  ["ForgePassVerifier", process.env.NEXT_PUBLIC_FORGEPASS_VERIFIER_ID],
  ["ForgePassRegistry", process.env.NEXT_PUBLIC_FORGEPASS_REGISTRY_ID],
];

const optionalContracts = [
  ["ForgePassNativeUltraHonkVerifier", process.env.NEXT_PUBLIC_FORGEPASS_NATIVE_ULTRAHONK_CONTRACT_ID],
].filter(([, id]) => Boolean(id));

const contracts = [...requiredContracts, ...optionalContracts];

function contractInstanceKey(contractId) {
  const contract = xdr.ScAddress.scAddressTypeContract(Buffer.from(StrKey.decodeContract(contractId)));
  return xdr.LedgerKey.contractData(new xdr.LedgerKeyContractData({
    contract,
    key: xdr.ScVal.scvLedgerKeyContractInstance(),
    durability: xdr.ContractDataDurability.persistent(),
  }));
}

async function main() {
  if (network.toLowerCase() !== "testnet") throw new Error(`Expected NEXT_PUBLIC_STELLAR_NETWORK=Testnet, got ${network}`);

  const missing = requiredContracts.filter(([, id]) => !id);
  if (missing.length) throw new Error(`Missing contract IDs: ${missing.map(([name]) => name).join(", ")}`);

  const server = new rpc.Server(rpcUrl);
  console.log("ForgePass live Soroban deployment check");
  console.log(`Network: ${network}`);
  console.log(`RPC: ${rpcUrl}`);

  for (const [name, id] of contracts) {
    const res = await server.getLedgerEntries(contractInstanceKey(id));
    if (!res.entries.length) throw new Error(`${name} not found on ${network}: ${id}`);
    const entry = res.entries[0];
    console.log(`${name}: FOUND`);
    console.log(`  contract: ${id}`);
    console.log(`  latestLedger: ${res.latestLedger}`);
    console.log(`  liveUntilLedgerSeq: ${entry.liveUntilLedgerSeq}`);
    console.log(`  explorer: ${explorerBase}/contract/${id}`);
  }

  if (!optionalContracts.length) {
    console.log("ForgePassNativeUltraHonkVerifier: NOT CONFIGURED");
    console.log("  set NEXT_PUBLIC_FORGEPASS_NATIVE_ULTRAHONK_CONTRACT_ID after deploying the VK-backed native verifier");
  }
}

main().catch((error) => {
  console.error(`ForgePass live deployment check failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});