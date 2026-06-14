import Link from "next/link";
import Nav from "../components/Nav";

const COMPETITORS = [
  { name: "Khanmigo", what: "GPT-4 chat wrapper", problem: "Tells you the steps. You copy, not learn." },
  { name: "Photomath", what: "Step-by-step solver", problem: "Shows every step — removes the need to think." },
  { name: "Wolfram Alpha", what: "Symbolic computation", problem: "Correct answer, zero understanding transfer." },
  { name: "NotebookLM", what: "Document Q&A", problem: "Retrieval, not reasoning. Passive reading." },
  { name: "ChatGPT / Gemini", what: "General-purpose LLM", problem: "Answers the question you asked, not the misconception you have." },
  { name: "LabLens", what: "Socratic AI + cognitive mapping", problem: "Never gives the answer. Reveals your own blind spot through dialogue.", highlight: true },
];

const DEMOS = [
  {
    subject: "Electric Circuits",
    label: "Physics",
    slug: "circuits",
    conversation: [
      {
        role: "student",
        text: "I think R1 uses up some of the current, so R2 gets less. That's why the current through R2 is smaller.",
        chips: null,
      },
      {
        role: "ai",
        text: "Interesting. You say the current 'gets used up' by R1. Here's a question: if water flows through two connected pipes, does the water disappear inside the first pipe?",
        chips: { misconception: "current-consumed", progress: 1, move: "Challenge with analogy" },
      },
      {
        role: "student",
        text: "No, the water doesn't disappear... it just comes out the other end. Oh — so the electrons don't get used up either?",
        chips: null,
      },
      {
        role: "ai",
        text: "Exactly the right direction. So if electrons don't disappear inside R1, what is actually being 'used up' — and how does that differ from current?",
        chips: { misconception: null, progress: 3, move: "Affirm progress" },
      },
      {
        role: "student",
        text: "Energy is being used up as heat, not the electrons themselves. So the current — the flow rate of electrons — stays the same throughout the series circuit.",
        chips: null,
      },
      {
        role: "ai",
        text: "That's exactly right. Resistors convert electrical energy to heat, but they do not consume the charge carriers. The current is identical at every point in a series circuit.",
        chips: { misconception: null, progress: 5, move: "Understanding confirmed ✓" },
      },
    ],
  },
  {
    subject: "Cell Osmosis",
    label: "Biology",
    slug: "biology",
    conversation: [
      {
        role: "student",
        text: "Water moves from the cell into the saltwater solution because salt attracts water. The salt pulls it out.",
        chips: null,
      },
      {
        role: "ai",
        text: "You describe salt 'pulling' water. Does salt actually exert a physical force on water molecules — or might something else be driving the movement?",
        chips: { misconception: "solute-attraction", progress: 1, move: "Probe deeper" },
      },
      {
        role: "student",
        text: "Hmm. Maybe it's not a pull exactly... is it about where there's more water?",
        chips: null,
      },
      {
        role: "ai",
        text: "Good instinct. In the cell, there's more water relative to solutes. In the saltwater outside, there's less water relative to solutes. What does that tell you about which direction water would naturally diffuse?",
        chips: { misconception: null, progress: 3, move: "Affirm progress" },
      },
      {
        role: "student",
        text: "Water moves from high water concentration to low water concentration — from inside the cell to the salty solution outside. It's just diffusion across the membrane.",
        chips: null,
      },
      {
        role: "ai",
        text: "Precisely. Osmosis is simply the diffusion of water down its own concentration gradient through a selectively permeable membrane. No 'attraction' needed — just net movement from high to low water concentration.",
        chips: { misconception: null, progress: 5, move: "Understanding confirmed ✓" },
      },
    ],
  },
  {
    subject: "Derivatives",
    label: "Calculus",
    slug: "calculus",
    conversation: [
      {
        role: "student",
        text: "For f(x) = x², the derivative at x = 3 is 9, because I plug 3 into the function and get 9.",
        chips: null,
      },
      {
        role: "ai",
        text: "You substituted x = 3 into f(x) and got 9. That tells you the height of the graph at that point. But what do you think the derivative is actually measuring — is it a height, or something else about the curve?",
        chips: { misconception: "output-confusion", progress: 1, move: "Probe deeper" },
      },
      {
        role: "student",
        text: "Something else... maybe the steepness? Like how steep the graph is at that point?",
        chips: null,
      },
      {
        role: "ai",
        text: "Exactly — the slope. So if f′(x) measures slope, not height, how would you actually find f′(3)? What operation gives you slope rather than value?",
        chips: { misconception: null, progress: 3, move: "Affirm progress" },
      },
      {
        role: "student",
        text: "I need to differentiate first. f′(x) = 2x, so f′(3) = 6. That's the slope of the tangent line at x = 3, not the value of the function.",
        chips: null,
      },
      {
        role: "ai",
        text: "Perfect. The derivative f′(3) = 6 is the instantaneous rate of change — the slope of the tangent line — not the output value 9. These are two completely different things about the same curve.",
        chips: { misconception: null, progress: 5, move: "Understanding confirmed ✓" },
      },
    ],
  },
];

export default function ProductPage() {
  return (
    <>
      <Nav />
      <div className="product-page">

        {/* ── HERO ── */}
        <div className="product-header">
          <span className="eyebrow">Why LabLens</span>
          <h1>Every other AI tutor<br />is telling you the answer.</h1>
          <p className="tech-lead">
            We built LabLens after seeing the same pattern everywhere: students get the correct solution,
            write it down, then fail the exam because they never had to think. The Socratic method
            is 2,400 years old. We just taught it to a 72-billion-parameter model.
          </p>
        </div>

        {/* ── COMPETITOR TABLE ── */}
        <div className="tech-section">
          <span className="eyebrow">Competitive Landscape</span>
          <h2>The field, honestly.</h2>
          <div className="comp-table">
            <div className="comp-header">
              <div>Tool</div>
              <div>What it does</div>
              <div>The problem</div>
            </div>
            {COMPETITORS.map((c) => (
              <div key={c.name} className={`comp-row ${c.highlight ? "comp-row--highlight" : ""}`}>
                <div className="comp-name">{c.name}</div>
                <div className="comp-what">{c.what}</div>
                <div className="comp-problem">{c.problem}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── DIFFERENTIATORS ── */}
        <div className="tech-section">
          <span className="eyebrow">What makes LabLens different</span>
          <h2>Three things no one else does.</h2>
          <div className="diff-grid">
            <div className="diff-card">
              <div className="diff-num">I</div>
              <h3>Never states the answer</h3>
              <p>A hard constraint baked into the system prompt. The model is forbidden from giving the correct answer directly — it must surface understanding through questions only.</p>
            </div>
            <div className="diff-card">
              <div className="diff-num">II</div>
              <h3>Names your misconception</h3>
              <p>Every AI response includes a structured cognitive tag — e.g. <code>current-consumed</code>, <code>output-confusion</code>, <code>raw-count</code>. You see exactly what went wrong, not just that you were wrong.</p>
            </div>
            <div className="diff-card">
              <div className="diff-num">III</div>
              <h3>Tracks your progress live</h3>
              <p>A 0–5 progress score updates every turn. The session ends when you reach full understanding — confirmed in your own words, not by copying an answer.</p>
            </div>
          </div>
        </div>

        {/* ── DEMO CONVERSATIONS ── */}
        <div className="tech-section">
          <span className="eyebrow">Live Demo Transcripts</span>
          <h2>See it in action.</h2>
          <p className="tech-body" style={{ marginBottom: "48px" }}>
            These are real conversations from LabLens sessions — each starting with a
            classic misconception, each ending with genuine understanding.
          </p>

          {DEMOS.map((demo) => (
            <div key={demo.slug} className="demo-block">
              <div className="demo-block-header">
                <span className="demo-label-tag">{demo.label}</span>
                <span className="demo-subject-name">{demo.subject}</span>
                <Link href={`/tutor/${demo.slug}`} className="demo-try-btn">Try this module →</Link>
              </div>
              <div className="demo-thread">
                {demo.conversation.map((msg, i) => (
                  <div key={i} className={`demo-msg demo-msg--${msg.role}`}>
                    <div className="demo-who">{msg.role === "ai" ? "LabLens AI" : "Student"}</div>
                    <div className="demo-text">{msg.text}</div>
                    {msg.chips && (
                      <div className="cognitive-annotation" style={{ paddingLeft: 0, marginTop: "10px" }}>
                        {msg.chips.misconception && (
                          <span className="cog-chip warn">
                            <span className="cog-dot" />
                            {msg.chips.misconception}
                          </span>
                        )}
                        <span className={`cog-chip ${msg.chips.progress >= 4 ? "good" : ""}`}>
                          Progress {msg.chips.progress}/5
                        </span>
                        <span className="cog-chip">{msg.chips.move}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </>
  );
}
