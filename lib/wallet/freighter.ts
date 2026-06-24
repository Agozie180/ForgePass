/**
 * Thin adapter over @stellar/freighter-api so the rest of the app depends on a
 * small, stable surface. All calls are guarded so they no-op gracefully when the
 * extension is absent (e.g. server render, or a judge without Freighter).
 */
import {
  getAddress,
  getNetwork,
  isAllowed,
  isConnected,
  requestAccess,
  setAllowed,
} from "@stellar/freighter-api";

export type WalletConnection = {
  address: string;
  network: string;
  networkPassphrase: string;
};

export async function detectFreighter(): Promise<boolean> {
  try {
    const res = await isConnected();
    return Boolean(res?.isConnected);
  } catch {
    return false;
  }
}

export async function isAuthorized(): Promise<boolean> {
  try {
    const res = await isAllowed();
    return Boolean(res?.isAllowed);
  } catch {
    return false;
  }
}

/** Prompt the user to grant access and return their connection details. */
export async function connectFreighter(): Promise<WalletConnection> {
  const access = await requestAccess();
  if (access.error) throw new Error(access.error);
  if (!access.address) {
    await setAllowed();
    const addr = await getAddress();
    if (addr.error || !addr.address) throw new Error(addr.error || "No address returned");
    access.address = addr.address;
  }
  const net = await getNetwork();
  if (net.error) throw new Error(net.error);
  return {
    address: access.address,
    network: net.network ?? "TESTNET",
    networkPassphrase: net.networkPassphrase ?? "",
  };
}

/** Re-read an already-authorized session without prompting. */
export async function restoreFreighter(): Promise<WalletConnection | null> {
  if (!(await isAuthorized())) return null;
  const addr = await getAddress();
  if (addr.error || !addr.address) return null;
  const net = await getNetwork();
  return {
    address: addr.address,
    network: net.network ?? "TESTNET",
    networkPassphrase: net.networkPassphrase ?? "",
  };
}
