"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight, Check, Copy, Fingerprint, Link2, LoaderCircle, LockKeyhole,
  RotateCcw, Share2, ShieldCheck, Sparkles, Wallet, X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { calculateTrustScore, DEMO_INPUTS, SCORE_MODEL, type TrustInputs } from "@/lib/domain/trust-score";
import { DEFAULT_POLICY_ID, deriveClaims, getPolicy, POLICIES } from "@/lib/domain/policies";
import { buildVerificationRecord, checkInputs, credentialId, shortHash, type ProofEnvelope, type VerificationRecord } from "@/lib/proof/forge";
import { generateBrowserUltraHonkProof } from "@/lib/proof/browser-ultrahonk";
import { submitNativeUltraHonkProof } from "@/lib/stellar/native-ultrahonk";
import { CONTRACTS, explorerContract, explorerTx, HAS_LIVE_CONTRACTS, HAS_NATIVE_ULTRAHONK_MILESTONE, HAS_NATIVE_ULTRAHONK_TX_HASH, HAS_NATIVE_ULTRAHONK_VERIFIER, shortId } from "@/lib/stellar/config";
import { DEMO_ADDRESS, useWallet } from "@/components/wallet-provider";

type Stage = "data" | "score" | "proving" | "verified" | "credential";
const stageOrder: Stage[] = ["data", "score", "proving", "verified", "credential"];
const stageLabels = ["Private data", "Local score", "ZK predicate", "Stellar", "Credential"];

const FIELDS: { key: keyof TrustInputs; label: string; prefix?: string; suffix?: string; max: number; step: number }[] = [
  { key: "monthlyIncomeUsd", label: "Monthly income", prefix: "$", max: 20_000, step: 250 },
  { key: "averageBalanceUsd", label: "Average balance", prefix: "$", max: 20_000, step: 250 },
  { key: "accountAgeMonths", label: "Account age", suffix: " mo", max: 120, step: 1 },
  { key: "eligibleTransactions", label: "Eligible transactions", suffix: " tx", max: 500, step: 5 },
  { key: "consistentMonths", label: "Consistent months", suffix: " / 12", max: 12, step: 1 },
];

const fmt = (n: number) => n.toLocaleString("en-US");

export function ProofExperience() {
  const wallet = useWallet();
  const connected = wallet.status === "connected" && Boolean(wallet.address);
  const holder = wallet.address ?? DEMO_ADDRESS;

  const [stage, setStage] = useState<Stage>("data");
  const [inputs, setInputs] = useState<TrustInputs>(DEMO_INPUTS);
  const [policyId, setPolicyId] = useState(DEFAULT_POLICY_ID);
  const [envelope, setEnvelope] = useState<ProofEnvelope | null>(null);
  const [record, setRecord] = useState<VerificationRecord | null>(null);
  const [proofStatus, setProofStatus] = useState("Ready");
  const [proofError, setProofError] = useState<string | null>(null);

  const policy = getPolicy(policyId);
  const stageIndex = stageOrder.indexOf(stage);

  const score = useMemo(() => {
    try {
      return calculateTrustScore(inputs);
    } catch {
      return null;
    }
  }, [inputs]);

  const guard = checkInputs(inputs);
  const qualifies = Boolean(score && score.total > policy.scoreThreshold);
  const claims = useMemo(
    () => (score ? deriveClaims(inputs, score, policy) : []),
    [inputs, score, policy],
  );

  const setField = (key: keyof TrustInputs, value: number) => {
    setInputs((prev) => {
      const next = { ...prev, [key]: Number.isFinite(value) ? value : 0 };
      if (key === "consistentMonths") next.consistentMonths = Math.min(next.consistentMonths, next.observedMonths);
      return next;
    });
  };

  const runProof = useCallback(async () => {
    if (!score) return;
    setStage("proving");
    setProofError(null);
    setProofStatus("Generating Noir witness in this browser");
    try {
      const env = await generateBrowserUltraHonkProof(policy, score, inputs, holder);
      setProofStatus("UltraHonk proof generated and locally verified");
      const now = new Date().toISOString();
      let rec = await buildVerificationRecord(env, holder, now);

      if (!wallet.isDemo) {
        setProofStatus("Submitting verify_proof to Stellar Testnet");
        const submission = await submitNativeUltraHonkProof(env, holder);
        rec = {
          ...rec,
          status: "Native UltraHonk verified on-chain",
          txHash: submission.hash,
          ledger: submission.latestLedger ?? rec.ledger,
          onChain: true,
        };
      } else {
        setProofStatus("Demo Mode cannot sign; showing verified milestone transaction");
      }

      setEnvelope(env);
      setRecord(rec);
      setStage("verified");
    } catch (error) {
      setProofError(error instanceof Error ? error.message : "UltraHonk proof or Testnet submission failed.");
      setStage("score");
    }
  }, [score, policy, inputs, holder, wallet.isDemo]);

  const reset = () => {
    setStage("data");
    setEnvelope(null);
    setRecord(null);
    setProofError(null);
    setProofStatus("Ready");
  };

  return (
    <div className="studio shell">
      <div className="studio-topbar">
        <div className="studio-brand"><span className="brand-mark small">F</span><span>Proof Studio</span></div>
        <div className="stage-track">
          {stageLabels.map((label, i) => (
            <span className={i <= stageIndex ? "active" : ""} key={label}>
              <i>{i < stageIndex ? <Check size={11} /> : i + 1}</i>{label}
            </span>
          ))}
        </div>
        <StudioWalletPill />
      </div>

      <div className="studio-body">
        <aside className="studio-sidebar">
          <p>WORKSPACE</p>
          <a className="active"><Fingerprint size={16} /> Reputation proof</a>
          <a><ShieldCheck size={16} /> Credential</a>
          <a><Sparkles size={16} /> Eligibility</a>
          <div className="privacy-note">
            <LockKeyhole size={16} /><strong>Local proof session</strong>
            <span>Your raw data is computed in-browser and never uploaded.</span>
          </div>
        </aside>

        <div className="studio-main">
          {!connected ? (
            <ConnectGate />
          ) : (
            <AnimatePresence mode="wait">
              {stage === "data" && (
                <motion.div key="data" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, filter: "blur(16px)", scale: 0.97 }} className="stage-content">
                  <div className="stage-title">
                    <div><span>STEP 1 OF 5</span><h3>Enter private financial signals</h3><p>These numbers are the sensitive data ForgePass is designed to protect. They stay in this browser and are never uploaded or written on-chain.</p></div>
                    <div className="secure-badge"><LockKeyhole size={14} /> Computed locally</div>
                  </div>

                  <div className="policy-row">
                    <span>Prove eligibility for</span>
                    <div className="policy-chips">
                      {POLICIES.map((p) => (
                        <button key={p.id} className={p.id === policyId ? "active" : ""} onClick={() => setPolicyId(p.id)}>
                          {p.name}<small>score &gt; {p.scoreThreshold}</small>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="field-grid">
                    {FIELDS.map((f) => (
                      <label key={f.key} className="field">
                        <span className="field-label">{f.label}</span>
                        <div className="field-value">
                          {f.prefix}<strong>{fmt(inputs[f.key])}</strong>{f.suffix}
                        </div>
                        <input
                          type="range" min={0} max={f.max} step={f.step} value={inputs[f.key]}
                          onChange={(e) => setField(f.key, Number(e.target.value))}
                          aria-label={f.label}
                        />
                      </label>
                    ))}
                  </div>

                  <div className="action-row">
                    {guard.ok ? (
                      <p><ShieldCheck size={16} /> {SCORE_MODEL.label} · weights sum to 100</p>
                    ) : (
                      <p className="warn"><X size={16} /> {guard.reason}</p>
                    )}
                    <button onClick={() => setStage("score")} disabled={!score || !guard.ok}>
                      Compute private score <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {stage === "score" && score && (
                <motion.div key="score" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -10 }} className="stage-content score-stage">
                  <div className="stage-title">
                    <div><span>STEP 2 OF 5</span><h3>Compute the score locally</h3><p>The score is useful for the holder, but the verifier does not need it. The claim is only “above {policy.scoreThreshold}”.</p></div>
                    <div className="secure-badge"><LockKeyhole size={14} /> Visible only to you</div>
                  </div>
                  <div className="score-layout">
                    <div className="score-ring" style={{ "--score": `${score.total * 3.6}deg` } as React.CSSProperties}>
                      <div><span>{score.total}</span><small>/ 100</small></div>
                    </div>
                    <div className="breakdown">
                      {[["Income", score.income], ["Balance", score.balance], ["Account age", score.accountAge], ["Activity", score.activity], ["Consistency", score.consistency]].map(([name, value]) => (
                        <div key={name as string}><span>{name}</span><i><b style={{ width: `${(value as number) * 4}%` }} /></i><strong>+{value}</strong></div>
                      ))}
                    </div>
                    <div className="threshold-card">
                      <small>SELECTED POLICY</small><strong>{policy.name}</strong>
                      <div><span>Required</span><b>Score above {policy.scoreThreshold}</b></div>
                      <div><span>Your result</span>
                        {qualifies
                          ? <b className="qualifies"><Check size={13} /> Qualifies</b>
                          : <b className="fails"><X size={13} /> Below threshold</b>}
                      </div>
                    </div>
                  </div>
                  <div className="action-row">
                    <p><LockKeyhole size={16} /> ZK turns the score into a predicate: “above {policy.scoreThreshold}”</p>
                    <div className="action-buttons">
                      <button className="ghost" onClick={() => setStage("data")}>Edit inputs</button>
                      <button onClick={runProof} disabled={!qualifies}>Generate UltraHonk proof <ArrowRight size={16} /></button>
                    </div>
                  </div>
                  {proofError && <p className="hint error">{proofError}</p>}
                  {!qualifies && <p className="hint">Raise your inputs until the score beats {policy.scoreThreshold}, or choose a lower policy tier.</p>}
                </motion.div>
              )}

              {stage === "proving" && (
                <motion.div key="proving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stage-content proving-stage">
                  <div className="proof-core">
                    <div className="proof-rings"><span /><span /><Fingerprint size={38} /></div>
                    <span className="mono-label">NOIR / ULTRAHONK LIVE PROVING</span>
                    <h3>Generating the ZK predicate</h3>
                    <p>The Noir circuit executes locally, Barretenberg generates an UltraHonk proof, and Freighter wallet mode submits verify_proof to Stellar Testnet.</p>
                    <div className="proof-progress"><motion.i initial={{ width: "4%" }} animate={{ width: "100%" }} transition={{ duration: 2, ease: "easeInOut" }} /></div>
                    <div className="proof-steps">
                      <span><Check size={12} /> Witness encoded</span>
                      <span><Check size={12} /> Constraints satisfied</span>
                      <span><LoaderCircle className="spin" size={12} /> {proofStatus}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {stage === "verified" && record && envelope && (
                <motion.div key="verified" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stage-content verified-stage">
                  <motion.div className="success-seal" initial={{ scale: 0.6, rotate: -8 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring" }}><ShieldCheck size={38} /></motion.div>
                  <span className="mono-label">{record.onChain ? "NATIVE ULTRAHONK VERIFIED ON STELLAR TESTNET" : envelope.proofKind === "browser-ultrahonk" ? "BROWSER ULTRAHONK PROOF · DEMO MODE TX" : HAS_LIVE_CONTRACTS ? "LIVE TESTNET CONTRACTS" : "LOCAL DEMO"}</span>
                  <h3>Credential ready. Privacy preserved.</h3>
                  <p>The only claim carried forward is: score above {policy.scoreThreshold}.<br />The raw inputs and exact score are gone; the Stellar contract links remain inspectable.</p>
                  <StellarVerificationPanel record={record} envelope={envelope} />
                  <button onClick={() => setStage("credential")}>Issue ForgePass Credential <ArrowRight size={16} /></button>
                </motion.div>
              )}

              {stage === "credential" && record && envelope && score && (
                <CredentialStage
                  record={record} envelope={envelope} policyName={policy.name}
                  claims={claims} holder={holder} network={wallet.network ?? "TESTNET"}
                  isDemo={wallet.isDemo} onReset={reset}
                />
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}

function StudioWalletPill() {
  const { status, address, network, isDemo, connectWallet, enableDemo } = useWallet();
  if (status === "connected" && address) {
    return (
      <div className="wallet-pill" title={address}>
        <span data-demo={isDemo} /><Wallet size={14} /> {address.slice(0, 4)}…{address.slice(-4)}
        <em>{isDemo ? "Demo" : network}</em>
      </div>
    );
  }
  return (
    <div className="wallet-pill-actions">
      <button onClick={connectWallet}><Wallet size={13} /> Connect</button>
      <button className="ghost" onClick={enableDemo}>Demo</button>
    </div>
  );
}

function ConnectGate() {
  const { connectWallet, enableDemo, error, status } = useWallet();
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="connect-gate">
      <span className="mono-label">STEP 0 · CONNECT</span>
      <h3>Connect to begin the proof ceremony</h3>
      <p>ForgePass issues your credential to a Stellar account. Connect Freighter for a real Testnet address, or use Demo Mode — judges can run the full flow either way.</p>
      <div className="connect-actions">
        <button onClick={connectWallet} disabled={status === "connecting"}>
          <Wallet size={16} /> {status === "connecting" ? "Connecting…" : "Connect Freighter"}
        </button>
        <button className="ghost" onClick={enableDemo}><Sparkles size={16} /> Use Demo Mode</button>
      </div>
      {error && <p className="warn">{error}</p>}
    </motion.div>
  );
}

function NativeUltraHonkStatus({ compact = false }: { compact?: boolean }) {
  const hasContract = HAS_NATIVE_ULTRAHONK_VERIFIER;
  const hasTx = HAS_NATIVE_ULTRAHONK_TX_HASH;

  if (compact) {
    return (
      <span>
        {HAS_NATIVE_ULTRAHONK_MILESTONE ? <b className="ok"><Check size={12} /> Verified on Stellar Testnet</b> : "Native UltraHonk deployment pending."}
        {hasContract && <> <a href={explorerContract(CONTRACTS.nativeUltraHonkVerifier)} target="_blank" rel="noreferrer">{shortId(CONTRACTS.nativeUltraHonkVerifier)} ↗</a></>}
      </span>
    );
  }

  return (
    <div className="native-links">
      {HAS_NATIVE_ULTRAHONK_MILESTONE ? <strong><ShieldCheck size={14} /> Native UltraHonk: Verified on Stellar Testnet</strong> : <span>Native UltraHonk deployment pending.</span>}
      {hasTx && <a className="explorer-link" href={explorerTx(CONTRACTS.nativeUltraHonkTxHash)} target="_blank" rel="noreferrer">View Native UltraHonk verification transaction ↗</a>}
      {hasContract && <a className="explorer-link" href={explorerContract(CONTRACTS.nativeUltraHonkVerifier)} target="_blank" rel="noreferrer">View Native UltraHonk verifier contract ↗</a>}
    </div>
  );
}

function StellarVerificationPanel({ record, envelope }: { record: VerificationRecord; envelope: ProofEnvelope }) {
  const rows: [string, React.ReactNode][] = [
    ["Proof flow", <b key="s" className="ok"><Check size={12} /> {record.status}</b>],
    ["Network", record.network],
    ["Wallet", `${record.holder.slice(0, 6)}…${record.holder.slice(-4)}`],
    ["Timestamp", new Date(record.timestamp).toUTCString()],
    ["Ledger", `#${fmt(record.ledger)}${record.onChain ? "" : " (simulated)"}`],
    ["Proof system", envelope.proofSystem],
    ["Proof commitment", shortHash(envelope.proofCommitment)],
    ["Proof bytes", envelope.proofSizeBytes ? `${fmt(envelope.proofSizeBytes)} bytes` : "metadata only"],
    ["Nullifier", shortHash(envelope.nullifier)],
    ["Tx hash", record.onChain
      ? <a key="tx" href={explorerTx(record.txHash)} target="_blank" rel="noreferrer">{shortHash(record.txHash)} ↗</a>
      : `${shortHash(record.txHash)} (simulated)`],
    ["Verifier", HAS_LIVE_CONTRACTS
      ? <a key="v" href={explorerContract(record.verifierContract)} target="_blank" rel="noreferrer">{shortId(record.verifierContract)} ↗</a>
      : `${shortId(record.verifierContract)} (placeholder)`],
    ["Registry", HAS_LIVE_CONTRACTS
      ? <a key="r" href={explorerContract(record.registryContract)} target="_blank" rel="noreferrer">{shortId(record.registryContract)} ↗</a>
      : `${shortId(record.registryContract)} (placeholder)`],
    ["Native UltraHonk", <NativeUltraHonkStatus key="native" compact />],
    ["Disclosed", <b key="d" className="zero">0 private values</b>],
  ];
  return (
    <div className="verify-panel">
      <div className="verify-panel-head">
        <ShieldCheck size={15} /> Stellar Verification Record
        <span className={record.onChain ? "tag live" : "tag demo"}>{record.onChain ? "Fresh on-chain tx" : envelope.proofKind === "browser-ultrahonk" ? "Proof real · demo tx" : "Demo"}</span>
      </div>
      <div className="verify-grid">
        {rows.map(([k, v]) => (<div key={k}><span>{k}</span><div>{v}</div></div>))}
      </div>
      <div className="verify-explorer">
        {record.onChain ? (
          <a className="explorer-link" href={explorerTx(record.txHash)} target="_blank" rel="noreferrer">
            <ShieldCheck size={14} /> View in Stellar Expert Testnet Explorer ↗
          </a>
        ) : HAS_NATIVE_ULTRAHONK_MILESTONE ? (
          <NativeUltraHonkStatus />
        ) : (
          <span className="explorer-link disabled" aria-disabled="true">
            Native UltraHonk deployment pending.
          </span>
        )}
      </div>
      {!record.onChain && (
        <p className="verify-note">Browser UltraHonk proof generation is live. Demo Mode cannot sign transactions, so it displays the verified milestone transaction; Freighter wallet mode submits a fresh native verify_proof transaction.</p>
      )}
    </div>
  );
}

type CredentialProps = {
  record: VerificationRecord; envelope: ProofEnvelope; policyName: string;
  claims: { key: string; label: string; satisfied: boolean }[];
  holder: string; network: string; isDemo: boolean; onReset: () => void;
};

function CredentialStage({ record, envelope, policyName, claims, holder, network, isDemo, onReset }: CredentialProps) {
  const id = credentialId(envelope);
  const [copied, setCopied] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const payload = {
      id, policy: policyName, holder, network,
      proof: envelope.proofCommitment.slice(0, 16),
      claims: claims.filter((c) => c.satisfied).map((c) => c.key),
      ts: record.timestamp,
    };
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    return `${window.location.origin}/?fp=${encoded}`;
  }, [id, policyName, holder, network, envelope, claims, record.timestamp]);

  useEffect(() => {
    if (!shareUrl) return;
    QRCode.toDataURL(shareUrl, { margin: 1, width: 200, color: { dark: "#0b1020", light: "#ffffff" } })
      .then(setQr).catch(() => setQr(null));
  }, [shareUrl]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard unavailable */ }
  };

  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: "ForgePass Credential", text: `ForgePass credential ${id}`, url: shareUrl }); return; } catch { /* cancelled */ }
    }
    copy();
  };

  return (
    <motion.div key="credential" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stage-content passport-stage">
      <div className="passport-copy">
        <span>STEP 5 OF 5</span>
        <h3>Your reputation is now portable.</h3>
        <p>Share eligibility claims with any participating institution. Browser UltraHonk proof generation is live; Freighter wallet sessions submit a fresh native verify_proof transaction, while Demo Mode displays the verified milestone transaction.</p>
        <div className="cred-actions">
          <button onClick={share} title="Open the ForgePass credential link"><Share2 size={14} /> Share Credential</button>
          <button onClick={copy}>{copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy credential link</>}</button>
          <button onClick={() => setShowQr((v) => !v)}><Link2 size={14} /> QR code</button>
          {record.onChain ? (
            <a className="cred-action-link" href={explorerTx(record.txHash)} target="_blank" rel="noreferrer" title="Open the on-chain transaction on Stellar Expert">
              <ShieldCheck size={14} /> View in Stellar Expert Testnet Explorer ↗
            </a>
          ) : HAS_NATIVE_ULTRAHONK_MILESTONE ? (
            <>
              <a className="cred-action-link" href={explorerTx(CONTRACTS.nativeUltraHonkTxHash)} target="_blank" rel="noreferrer" title="Open the native UltraHonk verification transaction on Stellar Expert">
                <ShieldCheck size={14} /> View Native UltraHonk verification transaction ↗
              </a>
              <a className="cred-action-link" href={explorerContract(CONTRACTS.nativeUltraHonkVerifier)} target="_blank" rel="noreferrer" title="Open the native UltraHonk verifier contract on Stellar Expert">
                <ShieldCheck size={14} /> View Native UltraHonk verifier contract ↗
              </a>
            </>
          ) : (
            <span className="cred-action-link disabled" title="Native UltraHonk milestone env vars are not configured">
              <ShieldCheck size={14} /> Native UltraHonk deployment pending
            </span>
          )}
        </div>
        {showQr && qr && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="qr-box">
            {/* eslint-disable-next-line @next/next/no-img-element -- generated data-URL QR, no loader needed */}
            <img src={qr} alt="ForgePass credential QR code" width={160} height={160} />
            <span>Scan to view the public credential claims</span>
          </motion.div>
        )}
        <button className="reset-button" onClick={onReset}><RotateCcw size={14} /> Replay demo</button>
      </div>

      <motion.div className="passport-card" initial={{ rotateY: 40, scale: 0.9 }} animate={{ rotateY: 0, scale: 1 }} transition={{ duration: 0.7 }}>
        <div className="passport-glow" />
        <div className="passport-head">
          <div className="brand"><span className="brand-mark small">F</span><span>FORGEPASS</span></div>
          <span className="active-pass"><i /> {isDemo ? "DEMO" : "ACTIVE"}</span>
        </div>
        <div className="passport-title">
          <small>REPUTATION CREDENTIAL</small>
          <strong>{holder.slice(0, 4)} •••• {holder.slice(-4)}</strong>
          <span className="passport-net">{network} · {new Date(record.timestamp).toLocaleDateString()}</span>
        </div>
        <div className="claims">
          {claims.map((claim, i) => (
            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.1 }} key={claim.key} className={claim.satisfied ? "" : "muted"}>
              <span><Check size={12} /></span>{claim.label}
            </motion.div>
          ))}
        </div>
        <div className="passport-proof"><span>Proof</span><code>{shortHash(envelope.proofCommitment)}</code></div>
        <div className="passport-foot">
          <span><ShieldCheck size={14} /> {record.onChain ? "On-chain verified" : HAS_NATIVE_ULTRAHONK_MILESTONE ? "Native UltraHonk proof generated" : HAS_LIVE_CONTRACTS ? "Contracts live" : "Demo credential"}</span>
          <span>{id}</span>
        </div>
      </motion.div>

      <p className="cred-privacy"><LockKeyhole size={13} /> No private financial information is stored or revealed. This credential contains only true/false qualification claims.</p>
    </motion.div>
  );
}

