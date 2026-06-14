import Nav from "../components/Nav";

export default function TechnologyPage() {
  return (
    <>
      <Nav />
      <div className="tech-page">

        {/* ── HEADER ── */}
        <div className="tech-header">
          <span className="eyebrow">Under the Hood</span>
          <h1>How LabLens<br />actually works.</h1>
          <p className="tech-lead">
            Not prompt engineering. Not a chatbot wrapper. A structured pipeline
            that turns every student reply into a cognitive state update.
          </p>
        </div>

        {/* ── ARCHITECTURE DIAGRAM ── */}
        <div className="arch-diagram">
          <div className="arch-title">
            <span className="eyebrow">Architecture</span>
          </div>
          <div className="arch-flow">
            <div className="arch-box arch-box--user">
              <div className="arch-icon">👤</div>
              <div className="arch-box-label">Student Input</div>
              <div className="arch-box-sub">Free-text reasoning</div>
            </div>
            <div className="arch-arrow">→</div>
            <div className="arch-box arch-box--next">
              <div className="arch-icon">▲</div>
              <div className="arch-box-label">Next.js Route Handler</div>
              <div className="arch-box-sub">/api/socratic · App Router</div>
            </div>
            <div className="arch-arrow">→</div>
            <div className="arch-box arch-box--featherless">
              <div className="arch-icon">🪶</div>
              <div className="arch-box-label">Featherless.ai</div>
              <div className="arch-box-sub">OpenAI-compatible API</div>
            </div>
            <div className="arch-arrow">→</div>
            <div className="arch-box arch-box--qwen">
              <div className="arch-icon">🧠</div>
              <div className="arch-box-label">Qwen2.5-72B-Instruct</div>
              <div className="arch-box-sub">70B parameter LLM</div>
            </div>
          </div>
          <div className="arch-return">
            <div className="arch-return-label">Structured JSON response ↓</div>
            <div className="arch-json">
{`{
  "reply": "If R1 uses up current, what happens
             to the electrons after passing through?",
  "analysis": {
    "misconception": "current-consumed",
    "confidence": 0.92,
    "progress": 1,
    "next_move": "challenge_analogy",
    "teacher_note": "Student holds the current-attrition
                     misconception — redirect with flow analogy."
  }
}`}
            </div>
          </div>
          <div className="arch-flow" style={{ marginTop: "32px" }}>
            <div className="arch-box arch-box--ui">
              <div className="arch-icon">💬</div>
              <div className="arch-box-label">Chat UI</div>
              <div className="arch-box-sub">Renders reply + chips</div>
            </div>
            <div className="arch-arrow">+</div>
            <div className="arch-box arch-box--chips">
              <div className="arch-icon">🏷</div>
              <div className="arch-box-label">Cognitive Chips</div>
              <div className="arch-box-sub">Misconception · Progress · Move</div>
            </div>
          </div>
        </div>

        {/* ── STACK ── */}
        <div className="tech-section">
          <span className="eyebrow">Stack</span>
          <h2>What powers each layer</h2>
          <div className="stack-grid">
            {[
              {
                layer: "Frontend",
                tech: "Next.js 16 App Router",
                detail: "Server components for static pages, client component for the chat thread. No unnecessary JS on first load.",
              },
              {
                layer: "AI Provider",
                tech: "Featherless.ai",
                detail: "OpenAI-compatible inference API. Serverless — no GPU management. Sub-10s cold starts on Qwen2.5-72B.",
              },
              {
                layer: "Model",
                tech: "Qwen2.5-72B-Instruct",
                detail: "72 billion parameter instruction-tuned model. Reliably produces valid JSON output given a strict system prompt.",
              },
              {
                layer: "Prompt Design",
                tech: "Socratic System Prompt",
                detail: "Every session injects: subject config, the target misconception, Socratic rules (never answer directly), and a JSON-only output contract.",
              },
              {
                layer: "Resilience",
                tech: "Hardcoded Fallback",
                detail: "If the API times out or fails, a curated fallback response is returned so the demo never breaks during a presentation.",
              },
              {
                layer: "Deployment",
                tech: "Vercel Edge Network",
                detail: "Static pages pre-rendered at build time. API routes are serverless functions. Zero config, global CDN.",
              },
            ].map((s) => (
              <div key={s.layer} className="stack-card">
                <div className="stack-layer">{s.layer}</div>
                <div className="stack-tech">{s.tech}</div>
                <div className="stack-detail">{s.detail}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── PROMPT DESIGN ── */}
        <div className="tech-section">
          <span className="eyebrow">Prompt Engineering</span>
          <h2>The Socratic contract</h2>
          <p className="tech-body">
            The system prompt is the core of LabLens. It does three things:
          </p>
          <div className="prompt-steps">
            <div className="prompt-step">
              <div className="prompt-step-num">1</div>
              <div>
                <strong>Injects subject context</strong> — the exact problem, the target misconception label, and the correct understanding — so the model knows what to guide toward without stating it.
              </div>
            </div>
            <div className="prompt-step">
              <div className="prompt-step-num">2</div>
              <div>
                <strong>Enforces Socratic rules</strong> — the model is forbidden from stating the answer. It must ask one question per reply, 2–4 sentences max.
              </div>
            </div>
            <div className="prompt-step">
              <div className="prompt-step-num">3</div>
              <div>
                <strong>Demands structured JSON</strong> — the response contract requires a <code>reply</code> field and a full <code>analysis</code> object with misconception tag, confidence, progress (0–5), next move, and teacher note. No prose outside the JSON.
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
