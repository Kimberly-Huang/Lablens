import Link from "next/link";
import Nav from "./components/Nav";

export default function Home() {
  return (
    <>
      <Nav />

      {/* ── HERO ── */}
      <section className="hero" id="top">
        <div className="hero-bg" />
        <div className="hero-inner">
          <span className="eyebrow">AI-Powered Socratic Tutor</span>
          <h1>Stop being<br />told the answer.</h1>
          <p className="hero-sub">
            <strong>Most AI tutors just give you the solution.</strong> LabLens asks the
            questions that make you find it yourself — and shows you
            exactly where your thinking went wrong.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/subjects" className="btn-primary">Start a session →</Link>
            <Link href="/product" className="btn-ghost">See how it differs</Link>
          </div>
          <p className="hero-powered">
            Powered by <span>Featherless.ai</span> · <span>Qwen2.5-72B</span> · Structured cognitive analysis
          </p>
        </div>
        <a href="#how" className="scroll-cue" aria-label="Scroll down">
          <span className="scroll-cue-label">How it works</span>
          <span className="scroll-cue-arrow">↓</span>
        </a>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="how" id="how">
        <div className="how-inner">
          <span className="eyebrow">The Method</span>
          <h2>Learning that sticks.</h2>
          <div className="how-grid">
            <div className="how-step">
              <div className="how-step-num">01</div>
              <h3>You explain your reasoning</h3>
              <p>Start with your honest understanding — even if it&apos;s wrong. LabLens needs your real thinking, not a polished answer.</p>
            </div>
            <div className="how-step">
              <div className="how-step-num">02</div>
              <h3>The AI asks, never tells</h3>
              <p>Instead of correcting you, LabLens surfaces a contradiction in your own reasoning through a targeted question. You do the work.</p>
            </div>
            <div className="how-step">
              <div className="how-step-num">03</div>
              <h3>Your misconception is mapped</h3>
              <p>Each reply is tagged: what you misunderstood, your progress level (0–5), and the tutor&apos;s next move. Total transparency.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SUBJECTS PREVIEW ── */}
      <section className="subjects-preview">
        <div className="subjects-preview-inner">
          <div className="subjects-preview-text">
            <span className="eyebrow">Six Modules</span>
            <h2>Physics. Calculus.<br />Chemistry. Biology.<br />Mechanics. Algebra.</h2>
            <p>Each module targets a classic misconception that students everywhere get wrong — and guides you to the correct understanding through dialogue alone.</p>
            <Link href="/subjects" className="btn-primary" style={{ marginTop: "32px", display: "inline-flex" }}>
              Browse all subjects →
            </Link>
          </div>
          <div className="subjects-preview-grid">
            {[
              { label: "Physics", name: "Electric Circuits", color: "#1a3a2a" },
              { label: "Calculus", name: "Derivatives", color: "#2a1a0a" },
              { label: "Chemistry", name: "Stoichiometry", color: "#0a1a2a" },
              { label: "Biology", name: "Cell Osmosis", color: "#1a0a2a" },
              { label: "Mechanics", name: "Newton's Laws", color: "#2a1a1a" },
              { label: "Algebra", name: "Quadratics", color: "#0a2a1a" },
            ].map((s) => (
              <div key={s.name} className="preview-chip" style={{ background: s.color }}>
                <span className="preview-chip-label">{s.label}</span>
                <span className="preview-chip-name">{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
