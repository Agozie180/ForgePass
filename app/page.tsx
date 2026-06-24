import { ArrowRight, Binary, Cpu, FileCheck2, Fingerprint, LockKeyhole, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { ProofExperience } from "@/components/proof-experience";
import { WalletButton } from "@/components/wallet-button";

const signals = [
  { icon: LockKeyhole, title: "Private by design", text: "Income, balance and score are computed in-browser and never leave your device." },
  { icon: ShieldCheck, title: "Verified on Stellar", text: "Soroban anchors a replay-safe verification record. The verifier learns only true / false." },
  { icon: Sparkles, title: "Portable credential", text: "One ForgePass credential. Many eligibility moments — lending, marketplaces, membership." },
];

const pipeline = [
  { icon: LockKeyhole, label: "Private data", note: "Income · balance · age · activity" },
  { icon: Cpu, label: "Off-chain compute", note: "Demo Reputation Model · local" },
  { icon: Binary, label: "Noir circuit", note: "Predicate: score > threshold" },
  { icon: Fingerprint, label: "UltraHonk proof", note: "Succinct, zero-knowledge" },
  { icon: ShieldCheck, label: "Soroban verify", note: "Replay-safe record" },
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
            ForgePass proves your financial credibility — income, balance, reputation score —
            without revealing any of it. Verifiable off-chain computation plus a private
            credential, secured by Noir, UltraHonk and Soroban.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#proof">Create a private proof <ArrowRight size={17} /></a>
            <a className="text-button" href="#architecture">See the architecture</a>
          </div>
          <div className="network-line">
            <span className="network-dot" /> <Wallet size={13} /> Freighter + Demo Mode <span>Stellar Testnet</span>
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
          <p>The score is computed locally and converted into a zero-knowledge proof. Stellar verifies the proof and issues a credential. Private data never touches the network.</p>
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

      <section className="proof-section" id="proof">
        <div className="shell section-heading">
          <div><span className="section-number">01 / PROOF STUDIO</span><h2>From private data to<br />portable trust.</h2></div>
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
