"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, CircleCheck, Fingerprint, LoaderCircle, LockKeyhole, RotateCcw, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { calculateTrustScore, DEMO_INPUTS } from "@/lib/domain/trust-score";

type Stage = "data" | "score" | "proving" | "verified" | "passport";
const stageOrder: Stage[] = ["data", "score", "proving", "verified", "passport"];

const claims = ["Income verified", "Balance verified", "Account age verified", "Transaction activity verified", "Trust score qualified"];
const inputs = [
  ["Monthly income", "$8,000", "Attested payroll"],
  ["Average balance", "$3,000", "90-day average"],
  ["Account age", "18 months", "Since activation"],
  ["Eligible activity", "120 tx", "Last 12 months"],
];

export function ProofExperience() {
  const [stage, setStage] = useState<Stage>("data");
  const score = useMemo(() => calculateTrustScore(DEMO_INPUTS), []);
  const stageIndex = stageOrder.indexOf(stage);

  const advance = () => {
    if (stage === "data") setStage("score");
    else if (stage === "score") {
      setStage("proving");
      window.setTimeout(() => setStage("verified"), 2400);
    } else if (stage === "verified") setStage("passport");
  };

  return (
    <div className="studio shell">
      <div className="studio-topbar">
        <div className="studio-brand"><span className="brand-mark small">F</span><span>Proof Studio</span></div>
        <div className="stage-track">
          {["Private data", "Trust score", "ZK proof", "Stellar", "Passport"].map((label, i) => (
            <span className={i <= stageIndex ? "active" : ""} key={label}><i>{i < stageIndex ? <Check size={11} /> : i + 1}</i>{label}</span>
          ))}
        </div>
        <div className="wallet-pill"><span /><Wallet size={14} /> GD7K...VQ2M</div>
      </div>

      <div className="studio-body">
        <aside className="studio-sidebar">
          <p>WORKSPACE</p>
          <a className="active"><Fingerprint size={16} /> Trust proof</a>
          <a><ShieldCheck size={16} /> Passport</a>
          <a><Sparkles size={16} /> Eligibility</a>
          <div className="privacy-note"><LockKeyhole size={16} /><strong>Local proof session</strong><span>Your raw data is never uploaded.</span></div>
        </aside>

        <div className="studio-main">
          <AnimatePresence mode="wait">
            {stage === "data" && (
              <motion.div key="data" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, filter: "blur(16px)", scale: .97 }} className="stage-content">
                <div className="stage-title"><div><span>STEP 1 OF 5</span><h3>Review your private signals</h3><p>These values are available only inside this browser session.</p></div><div className="secure-badge"><LockKeyhole size={14} /> Encrypted locally</div></div>
                <div className="input-grid">{inputs.map(([label, value, source]) => <article key={label}><div><span>{label}</span><small>{source}</small></div><strong>{value}</strong><CircleCheck size={17} /></article>)}</div>
                <div className="consistency-row"><span>Financial consistency</span><div className="month-dots">{Array.from({length:12},(_,i)=><i className={i<9?"filled":""} key={i}/>)}</div><strong>9 / 12 months</strong></div>
                <div className="action-row"><p><ShieldCheck size={16} /> Source attestations validated</p><button onClick={advance}>Generate private score <ArrowRight size={16} /></button></div>
              </motion.div>
            )}

            {stage === "score" && (
              <motion.div key="score" initial={{ opacity: 0, scale: .98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -10 }} className="stage-content score-stage">
                <div className="stage-title"><div><span>STEP 2 OF 5</span><h3>Your private trust score is ready</h3><p>The score is computed locally and will never be published.</p></div><div className="secure-badge"><LockKeyhole size={14} /> Visible only to you</div></div>
                <div className="score-layout">
                  <div className="score-ring" style={{"--score": `${score.total * 3.6}deg`} as React.CSSProperties}><div><span>{score.total}</span><small>/ 100</small></div></div>
                  <div className="breakdown">{Object.entries({Income:score.income,Balance:score.balance,"Account age":score.accountAge,Activity:score.activity,Consistency:score.consistency}).map(([name,value])=><div key={name}><span>{name}</span><i><b style={{width:`${value*4}%`}} /></i><strong>+{value}</strong></div>)}</div>
                  <div className="threshold-card"><small>SELECTED POLICY</small><strong>Prime Access</strong><div><span>Required</span><b>Score above 80</b></div><div><span>Your result</span><b className="qualifies"><Check size={13}/> Qualifies</b></div></div>
                </div>
                <div className="action-row"><p><LockKeyhole size={16} /> Only the statement “above 80” will be proven</p><button onClick={advance}>Generate ZK proof <ArrowRight size={16} /></button></div>
              </motion.div>
            )}

            {stage === "proving" && (
              <motion.div key="proving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stage-content proving-stage">
                <div className="proof-core"><div className="proof-rings"><span/><span/><Fingerprint size={38}/></div><span className="mono-label">NOIR / ULTRAHONK</span><h3>Forging your proof</h3><p>Proving that your private score exceeds 80 without revealing the score or its inputs.</p><div className="proof-progress"><motion.i initial={{width:"4%"}} animate={{width:"100%"}} transition={{duration:2.2,ease:"easeInOut"}} /></div><div className="proof-steps"><span><Check size={12}/> Witness encoded</span><span><Check size={12}/> Constraints satisfied</span><span><LoaderCircle className="spin" size={12}/> Building proof</span></div></div>
              </motion.div>
            )}

            {stage === "verified" && (
              <motion.div key="verified" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stage-content verified-stage">
                <motion.div className="success-seal" initial={{scale:.6,rotate:-8}} animate={{scale:1,rotate:0}} transition={{type:"spring"}}><ShieldCheck size={38}/></motion.div>
                <span className="mono-label">VERIFIED ON STELLAR TESTNET</span><h3>Trust score qualified</h3><p>The verifier learned one thing: your score is above 80.<br/>Every private value has been removed from this session.</p>
                <div className="receipt"><div><span>Proof</span><b>0x7f2a...91c4</b></div><div><span>Nullifier</span><b>0x3bd8...a120</b></div><div><span>Ledger</span><b>#14,829,104</b></div><div><span>Disclosed</span><b className="zero">0 private values</b></div></div>
                <button onClick={advance}>Issue Trust Passport <ArrowRight size={16}/></button>
              </motion.div>
            )}

            {stage === "passport" && (
              <motion.div key="passport" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="stage-content passport-stage">
                <div className="passport-copy"><span>STEP 5 OF 5</span><h3>Your trust is now portable.</h3><p>Share proof of qualification with any participating institution. They see verified claims, never the data behind them.</p><button className="reset-button" onClick={()=>setStage("data")}><RotateCcw size={14}/> Replay demo</button></div>
                <motion.div className="passport-card" initial={{rotateY:40,scale:.9}} animate={{rotateY:0,scale:1}} transition={{duration:.7}}><div className="passport-glow"/><div className="passport-head"><div className="brand"><span className="brand-mark small">F</span><span>FORGEPASS</span></div><span className="active-pass"><i/> ACTIVE</span></div><div className="passport-title"><small>TRUST PASSPORT</small><strong>GD7K •••• VQ2M</strong></div><div className="claims">{claims.map((claim,i)=><motion.div initial={{opacity:0,x:8}} animate={{opacity:1,x:0}} transition={{delay:.4+i*.12}} key={claim}><span><Check size={12}/></span>{claim}</motion.div>)}</div><div className="passport-foot"><span><ShieldCheck size={14}/> Verified on Stellar</span><span>FP-829104</span></div></motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
