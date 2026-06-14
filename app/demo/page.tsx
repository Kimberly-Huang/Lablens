"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Nav from "../components/Nav";
import type { Message, SocraticResponse, Analysis } from "../api/socratic/route";

/* ── Types ── */
type ChatMsg = {
  role: "user" | "assistant";
  content: string;
  analysis?: Analysis;
  source?: "featherless" | "fallback";
};

type Option = {
  tag: "wrong" | "partial" | "correct";
  label: string;
  text: string;
};

/* ── Subject configs ── */
type SubjectConfig = {
  id: string;
  label: string;
  name: string;
  photo: string;
  problem: string;
  /* Options per round. Round 0 = initial message, round 1 = after first AI reply, etc. */
  optionSets: Option[][];
};

const SUBJECTS: SubjectConfig[] = [
  {
    id: "circuits",
    label: "Physics",
    name: "Electric Circuits",
    photo: "/subjects/circuits.jpg",
    problem:
      'A 12V battery is connected to two resistors in series: R1 = 3Ω and R2 = 6Ω. A student claims the current through R2 is smaller because "some electricity gets used up by R1." What is wrong with this reasoning?',
    optionSets: [
      /* Round 0 — opening */
      [
        { tag: "wrong",   label: "Current gets used up", text: "I think R1 uses up some of the current, so R2 gets less. The current must be smaller after R1." },
        { tag: "partial", label: "Something changes, not sure what", text: "I know something changes when current passes through a resistor, but I'm not sure if it's the current or the voltage." },
        { tag: "correct", label: "Current stays the same", text: "I think the current stays the same throughout a series circuit — it's the voltage that drops across each resistor." },
      ],
      /* Round 1 — after first AI question */
      [
        { tag: "wrong",   label: "Still confused", text: "I still think the electrons must slow down or get reduced after R1, that's why we feel less electricity at R2." },
        { tag: "partial", label: "Water pipe analogy helps", text: "Oh, like water in a pipe — the water doesn't disappear, it just flows through. So the electrons don't disappear either?" },
        { tag: "correct", label: "Energy, not electrons", text: "The resistor converts electrical energy to heat, but the electrons themselves keep flowing. So current is conserved." },
      ],
      /* Round 2 */
      [
        { tag: "wrong",   label: "But energy goes down, so does current?", text: "If energy goes down, doesn't that mean there's less current? I'm still not clear on the difference." },
        { tag: "partial", label: "So it's the voltage that drops?", text: "So the current stays the same, but the voltage — the energy per electron — drops across each resistor?" },
        { tag: "correct", label: "Full understanding", text: "Current is the flow rate of electrons, which is conserved. Voltage is energy per charge, which drops across each resistor. Resistors convert electrical energy to heat, not reduce electron count." },
      ],
    ],
  },
  {
    id: "calculus",
    label: "Calculus",
    name: "Derivatives",
    photo: "/subjects/calculus.jpg",
    problem:
      "For f(x) = x², a student evaluates f(3) = 9 and says \"the derivative at x = 3 is also 9 because I just plug in x = 3.\" What is the misconception?",
    optionSets: [
      [
        { tag: "wrong",   label: "Derivative = plug in x", text: "The derivative at x = 3 is 9, because f(3) = 3² = 9. You just substitute the value." },
        { tag: "partial", label: "Derivative is about slope, I think", text: "I know the derivative has something to do with slope, but I'm not sure how to actually find f′(3) for f(x) = x²." },
        { tag: "correct", label: "Power rule gives f′(3) = 6", text: "f′(x) = 2x by the power rule, so f′(3) = 6. The derivative measures slope, not the function's output value." },
      ],
      [
        { tag: "wrong",   label: "The output value is the slope", text: "I still think plugging in x = 3 gives the derivative. Isn't that what evaluating the function means?" },
        { tag: "partial", label: "Slope is steepness?", text: "The derivative measures how steep the curve is? So it's not the height of the graph, but something about its angle?" },
        { tag: "correct", label: "Differentiate first, then evaluate", text: "I need to differentiate the formula first to get f′(x) = 2x, then substitute x = 3 to get f′(3) = 6 — the slope of the tangent." },
      ],
      [
        { tag: "wrong",   label: "Still confused on the difference", text: "I don't see how f(3) = 9 and f′(3) = 6 can both be right. Don't they measure the same thing?" },
        { tag: "partial", label: "Height vs steepness", text: "So f(3) = 9 tells me the height of the graph, and f′(3) = 6 tells me how steep it is at that point. Two different things about the same point." },
        { tag: "correct", label: "Complete distinction", text: "f(3) = 9 is the output value — how high the graph sits at x = 3. f′(3) = 6 is the instantaneous rate of change — the slope of the tangent line. They are completely different quantities." },
      ],
    ],
  },
  {
    id: "chemistry",
    label: "Chemistry",
    name: "Stoichiometry",
    photo: "/subjects/chemistry.jpg",
    problem:
      "For the reaction 2H₂ + O₂ → 2H₂O, a student has 4 mol H₂ and 3 mol O₂. They say \"O₂ is limiting because we have fewer moles of it.\" Is this correct?",
    optionSets: [
      [
        { tag: "wrong",   label: "Fewer moles = limiting", text: "O₂ is limiting because 3 mol is less than 4 mol. Whichever reactant you have less of runs out first." },
        { tag: "partial", label: "Not sure — maybe the ratio matters?", text: "I'm not certain. I think you can't just compare the raw numbers — the balanced equation's coefficients might matter." },
        { tag: "correct", label: "Check mole ratios from equation", text: "You need to use the 2:1 ratio from the equation. 4 mol H₂ requires 2 mol O₂, so O₂ is actually in excess and H₂ is the limiting reactant." },
      ],
      [
        { tag: "wrong",   label: "Raw count is what matters", text: "I still think 3 < 4 means O₂ runs out first. Why would the equation coefficients change that?" },
        { tag: "partial", label: "Coefficients tell us the ratio needed", text: "So the equation says we need 2 mol H₂ for every 1 mol O₂. So 4 mol H₂ would need 2 mol O₂ to fully react?" },
        { tag: "correct", label: "H₂ is actually limiting", text: "The 2:1 ratio means 4 mol H₂ needs exactly 2 mol O₂. We have 3 mol O₂, which is more than enough. H₂ is the limiting reactant, not O₂." },
      ],
      [
        { tag: "wrong",   label: "I'm still not convinced", text: "I still don't see why having more moles of H₂ makes it the limiting one. Having fewer moles of O₂ should mean O₂ is limiting." },
        { tag: "partial", label: "Need to calculate, not just compare", text: "So I should divide 4 mol H₂ by its coefficient 2, and divide 3 mol O₂ by its coefficient 1, then the smaller result is the limiting reactant?" },
        { tag: "correct", label: "Full correct reasoning", text: "Dividing by coefficients: 4/2 = 2 for H₂, and 3/1 = 3 for O₂. Since 2 < 3, H₂ is limiting. Comparing raw moles ignores the ratio the reaction requires." },
      ],
    ],
  },
  {
    id: "biology",
    label: "Biology",
    name: "Cell Osmosis",
    photo: "/subjects/biology.jpg",
    problem:
      "A red blood cell is placed in saltwater. A student says \"water moves out because salt attracts water and pulls it across the membrane.\" What is wrong here?",
    optionSets: [
      [
        { tag: "wrong",   label: "Salt attracts water", text: "Salt attracts water molecules like a magnet, so it pulls the water out of the cell and into the saltwater solution." },
        { tag: "partial", label: "Something to do with concentration", text: "I think it's about concentration — there's more salt outside, so water moves to balance it out somehow." },
        { tag: "correct", label: "Water diffuses down its own gradient", text: "Water moves from high water concentration inside the cell to low water concentration in the saltwater — passive diffusion down its own gradient, not attraction." },
      ],
      [
        { tag: "wrong",   label: "Attraction still seems right", text: "I still think salt must be attracting the water — why else would the water move specifically toward the salty side?" },
        { tag: "partial", label: "So water has its own concentration?", text: "Oh — so water itself has a concentration? More water on one side means higher water concentration, and it diffuses to where there's less?" },
        { tag: "correct", label: "Osmosis = diffusion of water", text: "Osmosis is just diffusion of water across a semipermeable membrane — from high water concentration (low solute) to low water concentration (high solute). No physical force from salt." },
      ],
      [
        { tag: "wrong",   label: "But doesn't solute pull water?", text: "But isn't it the dissolved salt that causes the water to move? It seems like the solute is actively doing something." },
        { tag: "partial", label: "Membrane is key too", text: "And the membrane is semipermeable — it lets water through but not the salt ions, so only water moves across?" },
        { tag: "correct", label: "Complete explanation", text: "Water diffuses passively from inside the cell (high water concentration) to the saltwater (low water concentration) through the semipermeable membrane. The salt doesn't attract — the water simply moves down its own concentration gradient." },
      ],
    ],
  },
];

const TAG_LABELS = { wrong: "Misconception", partial: "Partial", correct: "Strong" };
const MOVE_MAP: Record<string, string> = {
  probe_deeper: "Probing deeper",
  challenge_analogy: "Challenging with analogy",
  affirm_progress: "Affirming progress",
  confirm_understanding: "Understanding confirmed ✓",
};
const PROGRESS_LABELS = ["No engagement", "Engaging", "Probing", "Connecting", "Almost there", "Understood ✓"];

function downloadReport(msgs: ChatMsg[], subjectName: string) {
  const lines: string[] = [
    "LabLens — Demo Session Report",
    `Subject: ${subjectName}`,
    `Date: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
    "Powered by Featherless.ai · Qwen2.5-72B",
    "─".repeat(60), "",
  ];
  msgs.forEach((msg, i) => {
    lines.push(`[${i + 1}] ${msg.role === "assistant" ? "LabLens AI" : "You"}`);
    lines.push(msg.content);
    if (msg.analysis) {
      if (msg.analysis.misconception) lines.push(`  ⚠ Misconception: ${msg.analysis.misconception}`);
      lines.push(`  Progress: ${msg.analysis.progress}/5`);
      lines.push(`  Move: ${msg.analysis.next_move}`);
      if (msg.analysis.teacher_note) lines.push(`  Note: ${msg.analysis.teacher_note}`);
    }
    lines.push("");
  });
  lines.push("─".repeat(60));
  lines.push("Generated by LabLens · lablens.ai");
  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `LabLens-${subjectName.replace(/\s+/g, "-")}-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function DemoPage() {
  const [activeSubjectIdx, setActiveSubjectIdx] = useState(0);
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const subject = SUBJECTS[activeSubjectIdx];
  const round = msgs.filter((m) => m.role === "user").length;
  const options: Option[] = subject.optionSets[Math.min(round, subject.optionSets.length - 1)] ?? [];
  const lastAnalysis = msgs.filter((m) => m.analysis).at(-1)?.analysis ?? null;

  useEffect(() => {
    setMsgs([]);
    setInput("");
    setDone(false);
    setLoading(false);
  }, [activeSubjectIdx]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  // Fill textarea from a suggested option and focus it
  function fillOption(text: string) {
    setInput(text);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  async function send(text: string) {
    if (!text.trim() || loading || done) return;
    setInput("");
    const userMsg: ChatMsg = { role: "user", content: text.trim() };
    const next = [...msgs, userMsg];
    setMsgs(next);
    setLoading(true);
    try {
      const apiMsgs: Message[] = next.map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/socratic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMsgs, subject: subject.id }),
      });
      const data: SocraticResponse = await res.json();
      setMsgs([...next, { role: "assistant", content: data.reply, analysis: data.analysis, source: data.source }]);
      if (data.analysis.progress >= 5 || data.analysis.next_move === "confirm_understanding") {
        setDone(true);
      }
    } catch {
      setMsgs([...next, { role: "assistant", content: "Connection error — please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setMsgs([]);
    setInput("");
    setDone(false);
    setLoading(false);
  }

  return (
    <>
      <Nav />

      {/* Same photo hero as tutor page */}
      <div className="tutor-hero" style={{ maxWidth: "860px", margin: "0 auto" }}>
        <div className="tutor-hero-bg" style={{ backgroundImage: `url(${subject.photo})` }} />
        <div className="tutor-hero-body">
          <span className="eyebrow">{subject.label} · Guided Demo</span>
          <h1>{subject.name}</h1>
          <p>Choose from the options below — see how different answers lead to different AI responses.</p>
        </div>
      </div>

      {/* Subject switcher */}
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "24px 40px 0" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {SUBJECTS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActiveSubjectIdx(i)}
              style={{
                padding: "6px 16px",
                borderRadius: "20px",
                border: i === activeSubjectIdx ? "none" : "1.5px solid var(--border-dark)",
                background: i === activeSubjectIdx ? "var(--accent)" : "var(--card-bg)",
                color: i === activeSubjectIdx ? "white" : "var(--ink-mid)",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "var(--sans)",
                transition: "all .15s",
              }}
            >
              {s.label} — {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Same tutor-page layout */}
      <div className="tutor-page" style={{ paddingTop: "32px" }}>

        {/* Problem card */}
        <div className="problem-card">
          <span className="eyebrow">The Problem</span>
          <p>{subject.problem}</p>
        </div>

        {/* Chat thread */}
        <div className="chat-thread">
          {msgs.length === 0 && (
            <div className="chat-empty">
              Pick an option below to start the demo.<br />
              Each option shows a different type of student reasoning.
            </div>
          )}

          {msgs.map((msg, i) => (
            <div key={i} className={`chat-msg ${msg.role}`}>
              <div className="chat-msg-header">
                <div className={`chat-avatar ${msg.role === "assistant" ? "ai" : ""}`}>
                  {msg.role === "assistant" ? "L" : "Y"}
                </div>
                <span className="chat-who">{msg.role === "assistant" ? "LabLens AI" : "You"}</span>
              </div>
              <div className="chat-msg-body">{msg.content}</div>
              {msg.analysis && (
                <div className="cognitive-annotation">
                  {msg.analysis.misconception && (
                    <span className="cog-chip warn">
                      <span className="cog-dot" />
                      {msg.analysis.misconception}
                    </span>
                  )}
                  <span className={`cog-chip ${msg.analysis.progress >= 4 ? "good" : ""}`}>
                    Progress: {PROGRESS_LABELS[msg.analysis.progress]}
                  </span>
                  {msg.analysis.next_move && (
                    <span className="cog-chip">
                      {MOVE_MAP[msg.analysis.next_move] ?? msg.analysis.next_move}
                    </span>
                  )}
                </div>
              )}
              {msg.source && (
                <div className="source-tag">
                  via {msg.source === "featherless" ? "Featherless.ai · Qwen2.5-72B" : "local fallback"}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="chat-msg assistant">
              <div className="chat-msg-header">
                <div className="chat-avatar ai">L</div>
                <span className="chat-who">LabLens AI</span>
              </div>
              <div className="chat-msg-body">
                <div className="typing-dots"><span /><span /><span /></div>
              </div>
            </div>
          )}

          {done && (
            <div className="session-done">
              <h3>Session complete.</h3>
              <p>{lastAnalysis?.teacher_note ?? "You've worked through the misconception. The understanding is yours now."}</p>
              <div className="session-done-actions">
                <button onClick={reset}>↺ Try again</button>
                <button onClick={() => downloadReport(msgs, subject.name)}>⬇ Download PDF report</button>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="chat-bottom-spacer" />
      </div>

      {/* ── COMBINED INPUT BAR: suggestion chips + real textarea ── */}
      {!done && (
        <div className="demo-options-bar">
          <div className="demo-options-inner">

            {/* Suggestion chips row */}
            <div className="demo-options-header">
              <span className="demo-options-label">
                {loading ? "Waiting for AI…" : "Demo shortcuts — click to fill, or type your own below:"}
              </span>
              {msgs.length > 0 && (
                <button className="demo-options-reset" onClick={reset} disabled={loading}>
                  ↺ Start over
                </button>
              )}
            </div>
            <div className="demo-options-grid">
              {options.map((opt, i) => (
                <button
                  key={i}
                  className={`demo-option-btn demo-option-btn--${opt.tag}`}
                  onClick={() => fillOption(opt.text)}
                  disabled={loading}
                  title={opt.text}
                >
                  <span className={`demo-option-tag demo-option-tag--${opt.tag}`}>
                    {TAG_LABELS[opt.tag]}
                  </span>
                  <span className="demo-option-label">{opt.label}</span>
                </button>
              ))}
            </div>

            {/* Real textarea + Send (same as tutor page) */}
            <form
              style={{ display: "flex", gap: "10px", alignItems: "flex-end", marginTop: "10px" }}
              onSubmit={(e) => { e.preventDefault(); send(input); }}
            >
              <textarea
                ref={textareaRef}
                className="chat-input"
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
                }}
                placeholder="Type your own answer, or click a shortcut above… (Enter to send)"
                disabled={loading}
              />
              <button className="send-btn" type="submit" disabled={loading || !input.trim()}>
                {loading ? "…" : "Send"}
              </button>
            </form>

          </div>
        </div>
      )}
    </>
  );
}
