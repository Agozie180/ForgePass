"use client";

import { ChevronDown, LogOut, Wallet } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useWallet } from "@/components/wallet-provider";

function shortAddress(addr: string): string {
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

export function WalletButton() {
  const { status, address, network, isDemo, connectWallet, enableDemo, disconnect, error } = useWallet();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (status === "connected" && address) {
    return (
      <div className="wallet-button-wrap" ref={ref}>
        <button className="wallet-connected" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}>
          <span className="wallet-net-dot" data-demo={isDemo} />
          <Wallet size={14} />
          <span className="wallet-addr">{shortAddress(address)}</span>
          <span className="wallet-net-tag">{isDemo ? "Demo" : network}</span>
          <ChevronDown size={13} />
        </button>
        {open && (
          <div className="wallet-menu">
            <p className="wallet-menu-label">{isDemo ? "Demo Mode session" : "Freighter session"}</p>
            <code className="wallet-menu-addr">{address.slice(0, 12)}…{address.slice(-6)}</code>
            <span className="wallet-menu-net">Network · {network}</span>
            <button onClick={() => { disconnect(); setOpen(false); }}>
              <LogOut size={13} /> Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="wallet-button-wrap" ref={ref}>
      <button className="wallet-connect" onClick={() => setOpen((o) => !o)} disabled={status === "connecting"} aria-haspopup="menu" aria-expanded={open}>
        <Wallet size={15} />
        {status === "connecting" ? "Connecting…" : "Connect wallet"}
        <ChevronDown size={13} />
      </button>
      {open && (
        <div className="wallet-menu">
          <p className="wallet-menu-label">Choose how to enter</p>
          <button onClick={() => { connectWallet(); setOpen(false); }}>
            <Wallet size={14} /> Freighter wallet
          </button>
          <button onClick={() => { enableDemo(); setOpen(false); }}>
            <span className="demo-chip">Demo</span> Demo Mode (no wallet)
          </button>
          {error && <span className="wallet-menu-error">{error}</span>}
        </div>
      )}
    </div>
  );
}
