import { ArrowRight, Binary, Cpu, FileCheck2, Fingerprint, LockKeyhole, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { ProofExperience } from "@/components/proof-experience";
import { CONTRACTS, HAS_NATIVE_ULTRAHONK_VERIFIER, STELLAR_NETWORK, explorerContract, shortId } from "@/lib/stellar/config";
import { WalletButton } from "@/components/wallet-button";

const signals = [
  { icon: LockKeyhole, title: "Private by design", text: "Income, balance and score are computed in-browser and never leave your device." },
  { icon: ShieldCheck, title: "Live Stellar contracts", text: "Soroban verifier and registry contracts are deployed on Testnet; proof submission is labeled scaffolded." },
  { icon: Sparkles, title: "Portable credential", text: "One ForgePass credential. Many eligibility moments — lending, marketplaces, membership." },
];

const deploymentFacts = [
  { label: "Network", value: `${STELLAR_NETWORK.name} · RPC ${STELLAR_NETWORK.rpc.replace("https://", "")}` },
  { label: "Verifier contract", value: CONTRACTS.verifier, href: explorerContract(CONTRACTS.verifier) },
  { label: "Registry contract", value: CONTRACTS.registry, href: explorerContract(CONTRACTS.registry) },
  { label: "Current role", value: "Verifier consumes authorized proof receipts and nullifiers; registry issues holder credentials. Browser proof submission remains scaffolded." },
  { label: "Native UltraHonk", value: HAS_NATIVE_ULTRAHONK_VERIFIER ? CONTRACTS.nativeUltraHonkVerifier : "Pending deployment: requires VK/proof/public-input artifacts", href: HAS_NATIVE_ULTRAHONK_VERIFIER ? explorerContract(CONTRACTS.nativeUltraHonkVerifier) : undefined },
];

const truthRows = [
  { label: "Real", items: ["Frontend Proof Studio", "Reputation scoring model", "Noir circuits and tests", "Soroban verifier and registry contracts", "Verified Stellar Testnet deployments"] },
  { label: "Simulated / scaffolded", items: ["Browser-side UltraHonk proof generation", "Frontend Testnet transaction submission", "Full on-chain native proof verification transaction"] },
  { label: "Next", items: ["Real proof generation", "Signed bank, payroll, employer, or oracle attestations", "Independent audits"] },
];

const demoSteps = ["Connect wallet or use Demo Mode", "Enter private financial inputs", "Generate private trust score", "Create credential", "Review live Testnet contract links", "Export or share credential"];

const pipeline = [
  { icon: LockKeyhole, label: "Private data", note: "Income · balance · age · activity" },
  { icon: Cpu, label: "Off-chain compute", note: "Demo Reputation Model · local" },
  { icon: Binary, label: "Noir circuit", note: "Predicate: score > threshold" },
  { icon: Fingerprint, label: "UltraHonk proof", note: "Browser step scaffolded" },
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
            Private financial reputation credentials on Stellar. Prove trust. Reveal nothing. ForgePass proves a predicate over supplied financial data without exposing income, balance, history, or score.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#proof">Start judge demo <ArrowRight size={17} /></a>
            <a className="text-button" href="#testnet">View Testnet deployment</a>
          </div>
          <div className="network-line">
            <span className="network-dot" /> <Wallet size={13} /> Live on Stellar Testnet <span>{shortId(CONTRACTS.verifier)}</span>
          </div>
        </div>

        <div className="hero-visual" aria-label="Private data transformed into a verified credential">
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
          <p>The score is computed locally and mapped to public commitments. Live Stellar Testnet contracts are deployed for the verifier and registry; the browser proof transaction remains transparently scaffolded.</p>
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


      <section className="live-testnet shell" id="testnet">
        <div className="section-heading">
          <div><span className="section-number">01 / LIVE DEPLOYMENT</span><h2>Live on Stellar Testnet.</h2></div>
          <p>ForgePass is an honest deployed vertical slice: real contracts and circuits, with browser proof generation, transaction submission, and full native proof verification still labeled as scaffolded.</p>
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
          <div><span className="section-number">02 / REAL VS SIMULATED</span><h2>Clear, judge-ready scope.</h2></div>
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
          <div><span className="section-number">03 / DEMO FLOW</span><h2>Six steps judges can test.</h2></div>
          <p>Run it with Freighter on Testnet, or use labeled Demo Mode when no wallet extension is installed.</p>
        </div>
        <div className="demo-steps">
          {demoSteps.map((step, i) => <article key={step}><span>{i + 1}</span><strong>{step}</strong></article>)}
        </div>
      </section>
      <section className="proof-section" id="proof">
        <div className="shell section-heading">
          <div><span className="section-number">04 / PROOF STUDIO</span><h2>From private data to<br />portable trust.</h2></div>
          <p>Experience the complete ForgePass proof ceremony. Your values appear once, become a zero-knowledge proof, then disappear — leaving only a verified credential.</p>
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
