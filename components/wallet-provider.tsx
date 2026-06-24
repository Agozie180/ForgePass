"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { connectFreighter, restoreFreighter } from "@/lib/wallet/freighter";

export type WalletMode = "demo" | "wallet";
export type WalletStatus = "disconnected" | "connecting" | "connected";

/** Deterministic Stellar-style address used only for Demo Mode. */
export const DEMO_ADDRESS = "GD7KFORGEPASSDEMOXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXVQ2M";

type WalletState = {
  mode: WalletMode | null;
  status: WalletStatus;
  address: string | null;
  network: string | null;
  networkPassphrase: string | null;
  error: string | null;
  isDemo: boolean;
  connectWallet: () => Promise<void>;
  enableDemo: () => void;
  disconnect: () => void;
};

const WalletContext = createContext<WalletState | null>(null);
const STORAGE_KEY = "forgepass.wallet.mode";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<WalletMode | null>(null);
  const [status, setStatus] = useState<WalletStatus>("disconnected");
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [networkPassphrase, setNetworkPassphrase] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Restore a previously chosen mode after hydration (never during render).
  useEffect(() => {
    const saved = (typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEY)) as WalletMode | null;
    if (saved === "demo") {
      setMode("demo");
      setStatus("connected");
      setAddress(DEMO_ADDRESS);
      setNetwork("TESTNET");
      setNetworkPassphrase("Test SDF Network ; September 2015");
    } else if (saved === "wallet") {
      restoreFreighter().then((conn) => {
        if (conn) {
          setMode("wallet");
          setStatus("connected");
          setAddress(conn.address);
          setNetwork(conn.network);
          setNetworkPassphrase(conn.networkPassphrase);
        }
      });
    }
  }, []);

  const connectWallet = useCallback(async () => {
    setStatus("connecting");
    setError(null);
    try {
      const conn = await connectFreighter();
      setMode("wallet");
      setStatus("connected");
      setAddress(conn.address);
      setNetwork(conn.network);
      setNetworkPassphrase(conn.networkPassphrase);
      window.localStorage.setItem(STORAGE_KEY, "wallet");
    } catch (e) {
      setStatus("disconnected");
      setError(
        e instanceof Error
          ? `${e.message}. Install the Freighter extension or use Demo Mode.`
          : "Could not connect. Use Demo Mode to continue.",
      );
    }
  }, []);

  const enableDemo = useCallback(() => {
    setMode("demo");
    setStatus("connected");
    setAddress(DEMO_ADDRESS);
    setNetwork("TESTNET");
    setNetworkPassphrase("Test SDF Network ; September 2015");
    setError(null);
    window.localStorage.setItem(STORAGE_KEY, "demo");
  }, []);

  const disconnect = useCallback(() => {
    setMode(null);
    setStatus("disconnected");
    setAddress(null);
    setNetwork(null);
    setNetworkPassphrase(null);
    setError(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo<WalletState>(
    () => ({
      mode,
      status,
      address,
      network,
      networkPassphrase,
      error,
      isDemo: mode === "demo",
      connectWallet,
      enableDemo,
      disconnect,
    }),
    [mode, status, address, network, networkPassphrase, error, connectWallet, enableDemo, disconnect],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletState {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
