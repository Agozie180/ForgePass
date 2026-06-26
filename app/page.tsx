import { ArrowRight, Binary, Cpu, FileCheck2, Fingerprint, LockKeyhole, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { ProofExperience } from "@/components/proof-experience";
import { CONTRACTS, HAS_NATIVE_ULTRAHONK_MILESTONE, HAS_NATIVE_ULTRAHONK_TX_HASH, HAS_NATIVE_ULTRAHONK_VERIFIER, STELLAR_NETWORK, explorerContract, explorerTx, shortId } from "@/lib/stellar/config";
import { WalletButton } from "@/components/wallet-button";

const signals = [
  { icon: LockKeyhole, title: "What it does", text: "ForgePass turns private financial signals into a shareable reputation credential." },
  { icon: ShieldCheck, title: "Why ZK matters", text: "The verifier learns only the policy result, not the income, balance, activity, or score." },
  { icon: Sparkles, title: "Why Stellar fits", text: "Stellar gives the credential low-cost public rails, wallet binding, and Soroban contracts." },
];

const deploymentFacts = [
  { label: "Network", value: `${STELLAR_NETWORK.name} · RPC ${STELLAR_NETWORK.rpc.replace("https://", "")}` },
  { label: "Verifier contract", value: CONTRACTS.verifier, href: explorerContract(CONTRACTS.verifier) },
  { label: "Registry contract", value: CONTRACTS.registry, href: explorerContract(CONTRACTS.registry) },
  { label: "Current role", value: "Verifier consumes authorized proof receipts and nullifiers; registry issues holder credentials. Browser proof submission remains scaffolded." },
  { label: "Native UltraHonk", value: HAS_NATIVE_ULTRAHONK_MILESTONE ? "Verified milestone on Stellar Testnet" : "Native UltraHonk deployment pending", href: HAS_NATIVE_ULTRAHONK_VERIFIER ? explorerContract(CONTRACTS.nativeUltraHonkVerifier) : undefined },
  { label: "Native verify_proof tx", value: HAS_NATIVE_ULTRAHONK_TX_HASH ? shortId(CONTRACTS.nativeUltraHonkTxHash, 8, 8) : "Milestone transaction pending", href: HAS_NATIVE_ULTRAHONK_TX_HASH ? explorerTx(CONTRACTS.nativeUltraHonkTxHash) : undefined },
];

const truthRows = [
  { label: "Real", items: ["Frontend Proof Studio", "Reputation scoring model", "Noir circuits and tests", "Soroban verifier and registry contracts", "Native UltraHonk verifier milestone", "Verified Stellar Testnet deployments"] },
  { label: "Simulated / scaffolded", items: ["Browser-side UltraHonk proof generation", "Frontend Testnet transaction submission from the demo UI"] },
  { label: "Next", items: ["Real proof generation", "Signed bank, payroll, employer, or oracle attestations", "Independent audits"] },
];

const demoSteps = ["Connect wallet or use Demo Mode", "Enter private income, balance, and activity", "Compute the score locally", "Generate the ZK predicate scaffold", "Inspect live Stellar Testnet contracts", "Export or share the credential"];

const zkReasons = [
  "Financial trust checks usually expose too much raw data.",
  "ForgePass only needs to prove a predicate, such as score > 80.",
  "The circuit binds the policy, holder, nullifier, and result so the claim can be checked without revealing private inputs.",
];

const stellarReasons = [
  "Stellar accounts bind credentials to wallets judges can inspect on Testnet.",
  "Soroban contracts provide replay protection, registry state, events, and upgradeable verification surfaces.",
  "Low fees and fast finality make repeated credential checks practical for real financial workflows.",
];

const pipeline = [
  { icon: LockKeyhole, label: "Private data", note: "Income · balance · age · activity" },
  { icon: Cpu, label: "Off-chain compute", note: "Demo Reputation Model · local" },
  { icon: Binary, label: "Noir circuit", note: "Predicate: score > threshold" },
  { icon: Fingerprint, label: "UltraHonk scaffold", note: "Proof path explicit" },
  { icon: ShieldCheck, label: "Soroban contracts", note: "Verifier + registry live" },
  { icon: FileCheck2, label: "Credential", note: "Verified claims only" },
];

export default function Home() {
  return (
    <main>
      <nav className="nav shell">
        <a className="brand" href="#top" aria-label="ForgePass home">
          <span className="brand-mark">F</span>
          <span>FORGEPASS</span>
        </a>
        <div className="nav-links">
          <a href="#architecture">Architecture</a>
          <a href="#testnet">Testnet</a>
          <a href="#truth">Scope</a>
          <a href="#proof">Proof Studio</a>
          <a href="#security">Privacy</a>
          <WalletButton />
        </div>
      </nav>

      <section className="hero shell" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><span /> Zero-knowledge reputation credential · Stellar</div>
          <h1>Forge trust.<br /><em>Reveal nothing.</em></h1>
          <p>
            ForgePass lets a person prove they meet a financial trust policy, such as score &gt; 80, without revealing income, balance, transaction activity, or the score. ZK keeps the data private; Stellar makes the credential portable and verifiable.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#proof">Start judge demo <ArrowRight size={17} /></a>
            <a className="text-button" href="#why-zk">Why ZK + Stellar</a>
          </div>
          <div className="network-line">
            <span className="network-dot" /> <Wallet size={13} /> Live on Stellar Testnet <span>{shortId(CONTRACTS.verifier)}</span>
          </div>
        </div>

        <div className="hero-visual" aria-label="Private data transformed into a privacy-preserving credential">
          <div className="orb orb-one" /><div className="orb orb-two" />
          <div className="data-card private-card">
            <small>PRIVATE SIGNALS</small>
            <div><span>Income</span><strong>••••••</strong></div>
            <div><span>Balance</span><strong>••••••</strong></div>
            <div><span>Score</span><strong>••••••</strong></div>
          </div>
          <div className="proof-line"><span>ZK PROOF</span></div>
          <div className="data-card verified-card">
            <span className="verified-icon"><ShieldCheck size={24} /></span>
            <small>FORGEPASS VERIFIED</small>
            <strong>Reputation qualified</strong>
            <p>No private values disclosed</p>
          </div>
        </div>
      </section>

      <section className="signal-strip shell" id="security">
        {signals.map(({ icon: Icon, title, text }) => (
          <article key={title}><Icon size={20} /><div><strong>{title}</strong><p>{text}</p></div></article>
        ))}
      </section>

      <section className="architecture shell" id="architecture">
        <div className="section-heading">
          <div><span className="section-number">00 / ARCHITECTURE</span><h2>Private data in.<br />Cryptographic proof out.</h2></div>
          <p>ForgePass separates private computation from public verification. The private data stays local; the public layer gets commitments, nullifiers, contract IDs, and credential state.</p>
        </div>
        <div className="pipeline">
          {pipeline.map(({ icon: Icon, label, note }, i) => (
            <div className="pipeline-step" key={label}>
              <span className="pipeline-index">{String(i + 1).padStart(2, "0")}</span>
              <Icon size={22} />
              <strong>{label}</strong>
              <small>{note}</small>
              {i < pipeline.length - 1 && <i className="pipeline-arrow"><ArrowRight size={16} /></i>}
            </div>
          ))}
        </div>
      </section>



      <section className="why-section shell" id="why-zk">
        <div className="section-heading compact">
          <div><span className="section-number">01 / WHY ZK + STELLAR</span><h2>The privacy and chain choices are the product.</h2></div>
          <p>ForgePass is not just a score UI. ZK is what prevents data over-disclosure, and Stellar is the public network where the resulting credential can be anchored, checked, and reused.</p>
        </div>
        <div className="why-grid">
          <article>
            <span>Why zero-knowledge</span>
            <h3>Prove the answer, not the bank statement.</h3>
            <ul>{zkReasons.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
          <article>
            <span>Why Stellar</span>
            <h3>Portable trust needs public, low-cost rails.</h3>
            <ul>{stellarReasons.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
        </div>
      </section>
      <section className="live-testnet shell" id="testnet">
        <div className="section-heading">
          <div><span className="section-number">02 / LIVE DEPLOYMENT</span><h2>Stellar integration you can inspect.</h2></div>
          <p>ForgePass is deployed on Stellar Testnet with verifier, registry, and VK-backed native UltraHonk verifier contracts judges can open in Stellar Expert. The demo shows the verified milestone transaction; fresh frontend proof submission is still labeled as future work.</p>
        </div>
        <div className="testnet-grid">
          {deploymentFacts.map((fact) => (
            <article key={fact.label}>
              <span>{fact.label}</span>
              {fact.href ? <a href={fact.href} target="_blank" rel="noreferrer">{fact.value}</a> : <strong>{fact.value}</strong>}
            </article>
          ))}
        </div>
        <p className="attestation-note">ForgePass proves a predicate over supplied data. In production, data truth comes from signed attestations by banks, payroll providers, employers, or trusted issuers.</p>
      </section>

      <section className="truth-section shell" id="truth">
        <div className="section-heading compact">
          <div><span className="section-number">03 / REAL VS SIMULATED</span><h2>No guessing required.</h2></div>
          <p>No audited production launch claim is implied. The submission is a deployed Stellar Testnet vertical slice with transparent proof-generation scaffolding.</p>
        </div>
        <div className="truth-grid">
          {truthRows.map((row) => (
            <article key={row.label}>
              <strong>{row.label}</strong>
              <ul>{row.items.map((item) => <li key={item}>{item}</li>)}</ul>
            </article>
          ))}
        </div>
      </section>

      <section className="demo-flow shell" id="demo-flow">
        <div className="section-heading compact">
          <div><span className="section-number">04 / DEMO FLOW</span><h2>A demo with one job: make privacy obvious.</h2></div>
          <p>Run it with Freighter on Testnet, or use labeled Demo Mode. The private numbers appear once, the policy result remains, and the Stellar contract links stay visible.</p>
        </div>
        <div className="demo-steps">
          {demoSteps.map((step, i) => <article key={step}><span>{i + 1}</span><strong>{step}</strong></article>)}
        </div>
      </section>
      <section className="proof-section" id="proof">
        <div className="shell section-heading">
          <div><span className="section-number">05 / PROOF STUDIO</span><h2>From hidden inputs to<br />shareable eligibility.</h2></div>
          <p>Run the core story end to end: private inputs, local score, ZK predicate scaffold, live Stellar contract references, and a credential that contains claims instead of raw data.</p>
        </div>
        <ProofExperience />
      </section>

      <footer className="shell footer">
        <div className="brand"><span className="brand-mark">F</span><span>FORGEPASS</span></div>
        <p>Reputation verified. Privacy preserved. The zero-knowledge trust layer for the digital economy.</p>
        <span>Built on Stellar · Noir · UltraHonk</span>
      </footer>
    </main>
  );
}
