import { ArrowRight, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { ProofExperience } from "@/components/proof-experience";

const signals = [
  { icon: LockKeyhole, title: "Private by design", text: "Sensitive values stay inside your proof session." },
  { icon: ShieldCheck, title: "Verified on Stellar", text: "Every claim is anchored with replay protection." },
  { icon: Sparkles, title: "Portable trust", text: "One passport. Many eligibility moments." },
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
          <a href="#proof">How it works</a>
          <a href="#security">Security</a>
          <a className="nav-cta" href="#proof">Launch ForgePass <ArrowRight size={14} /></a>
        </div>
      </nav>

      <section className="hero shell" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><span /> Zero-knowledge trust infrastructure</div>
          <h1>Prove trust.<br /><em>Reveal nothing.</em></h1>
          <p>
            ForgePass turns private financial signals into verifiable credentials,
            without exposing the data behind them.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#proof">Create a private proof <ArrowRight size={17} /></a>
            <a className="text-button" href="#proof">Watch the 60-second flow</a>
          </div>
          <div className="network-line">
            <span className="network-dot" /> Live protocol preview <span>Stellar Testnet</span>
          </div>
        </div>

        <div className="hero-visual" aria-label="Private data transformed into a verified credential">
          <div className="orb orb-one" /><div className="orb orb-two" />
          <div className="data-card private-card">
            <small>PRIVATE SIGNALS</small>
            <div><span>Income</span><strong>••••••</strong></div>
            <div><span>Balance</span><strong>••••••</strong></div>
            <div><span>Activity</span><strong>••••••</strong></div>
          </div>
          <div className="proof-line"><span>PROOF</span></div>
          <div className="data-card verified-card">
            <span className="verified-icon"><ShieldCheck size={24} /></span>
            <small>FORGEPASS VERIFIED</small>
            <strong>Trust score qualified</strong>
            <p>No private values disclosed</p>
          </div>
        </div>
      </section>

      <section className="signal-strip shell" id="security">
        {signals.map(({ icon: Icon, title, text }) => (
          <article key={title}><Icon size={20} /><div><strong>{title}</strong><p>{text}</p></div></article>
        ))}
      </section>

      <section className="proof-section" id="proof">
        <div className="shell section-heading">
          <div><span className="section-number">01 / PROOF STUDIO</span><h2>From private data to<br />portable trust.</h2></div>
          <p>Experience the complete ForgePass proof ceremony. Your values appear once, become a zero-knowledge proof, then disappear.</p>
        </div>
        <ProofExperience />
      </section>

      <footer className="shell footer">
        <div className="brand"><span className="brand-mark">F</span><span>FORGEPASS</span></div>
        <p>The zero-knowledge trust layer for the digital economy.</p>
        <span>Built on Stellar</span>
      </footer>
    </main>
  );
}
