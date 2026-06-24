/**
 * Stellar network + deployment configuration.
 *
 * ForgePass targets Stellar Testnet. Contract IDs are read from public env vars
 * when a real deployment exists; otherwise the documented placeholders below are
 * shown and the UI labels the verification record as a local demo (never as
 * deployed mainnet activity). See docs/SECURITY.md.
 */
export const STELLAR_NETWORK = {
  name: "Testnet",
  passphrase: "Test SDF Network ; September 2015",
  horizon: "https://horizon-testnet.stellar.org",
  rpc: "https://soroban-testnet.stellar.org",
  explorer: "https://stellar.expert/explorer/testnet",
} as const;

/** Soroban contract IDs. Replace via env once deployed to Testnet. */
export const CONTRACTS = {
  verifier:
    process.env.NEXT_PUBLIC_FORGEPASS_VERIFIER_ID ??
    "CAFORGEPASSVERIFIER000000000000000000000000000000000DEMO",
  registry:
    process.env.NEXT_PUBLIC_FORGEPASS_REGISTRY_ID ??
    "CAFORGEPASSREGISTRY000000000000000000000000000000000DEMO",
} as const;

/** True when real on-chain contract IDs have been provided via env. */
export const HAS_LIVE_CONTRACTS =
  Boolean(process.env.NEXT_PUBLIC_FORGEPASS_VERIFIER_ID) &&
  Boolean(process.env.NEXT_PUBLIC_FORGEPASS_REGISTRY_ID);

export function shortId(id: string, lead = 6, tail = 4): string {
  if (id.length <= lead + tail) return id;
  return `${id.slice(0, lead)}…${id.slice(-tail)}`;
}

export function explorerContract(id: string): string {
  return `${STELLAR_NETWORK.explorer}/contract/${id}`;
}

export function explorerTx(hash: string): string {
  return `${STELLAR_NETWORK.explorer}/tx/${hash}`;
}
