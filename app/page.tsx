"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import type { Analysis, Message, SocraticResponse } from "./api/socratic/route";

type Subject = "circuits" | "calculus" | "chemistry";

const SUBJECTS: Record<Subject, { label: string; short: string; problem: string; starter: string }> = {
  circuits: {
    label: "Physics — Electric Circuits",
    short: "Physics",
    problem:
      "A 12V battery is connected to two resistors in series: R1 = 3Ω and R2 = 6Ω. A student says the current through R2 is smaller than the current through R1 because \"some electricity gets used up by R1.\" What is wrong with this reasoning?",
    starter: "I think the current does get smaller after R1, because R1 uses up some of the electricity.",
  },
  calculus: {
    label: "Calculus — Derivatives",
    short: "Calculus",
    problem:
      "For f(x) = x², a student evaluates the function at x = 3 and gets f(3) = 9. They then say \"the derivative at x = 3 is also 9 because I just plug in x = 3.\" What is the misconception here?",
    starter: "I think the derivative at x = 3 is 9, since I just compute f(3) = 3² = 9.",
  },
  chemistry: {
    label: "Chemistry — Stoichiometry",
    short: "Chemistry",
    problem:
      "For the reaction 2H₂ + O₂ → 2H₂O, a student has 4 mol H₂ and 3 mol O₂. They say \"O₂ is the limiting reactant because we have fewer moles of it.\" Is this correct?",
    starter: "O₂ is limiting because 3 < 4, so there's less of it.",
  },
};

const PROGRESS_LABELS = ["Not started", "Engaging", "Probing", "Connecting", "Almost there", "Understood!"];

const MOVE_LABELS: Record<string, string> = {
  probe_deeper: "Probe deeper",
  challenge_analogy: "Challenge with analogy",
  affirm_progress: "Affirm & push further",
  confirm_understanding: "Confirm understanding",
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  analysis?: Analysis;
};

function ProgressBar({ value }: { value: number }) {
  const pct = Math.round((value / 5) * 100);
  const color = value >= 4 ? "#10b981" : value >= 2 ? "#6366f1" : "#6b7280";
  return (
    <div className="progress-wrap">
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span style={{ color }}>{PROGRESS_LABELS[value]}</span>
    </div>
  );
}

function CognitiveSidebar({
  analysis,
  source,
  subject,
}: {
  analysis: Analysis | null;
  source: "featherless" | "fallback" | null;
  subject: Subject;
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="kicker">Cognitive Map</span>
        <p className="sidebar-sub">AI reasoning — updated each reply</p>
      </div>

      <div className="sidebar-card">
        <span className="card-label">Cognitive progress</span>
        <ProgressBar value={analysis?.progress ?? 0} />
      </div>

      <div className="sidebar-card">
        <span className="card-label">Detected misconception</span>
        {analysis?.misconception ? (
          <>
            <p className="misconception-tag">{analysis.misconception}</p>
            <div className="confidence-row">
              <span>Confidence</span>
              <div className="conf-bar">
                <div
                  className="conf-fill"
                  style={{ width: `${Math.round((analysis.confidence ?? 0) * 100)}%` }}
                />
              </div>
              <strong>{Math.round((analysis.confidence ?? 0) * 100)}%</strong>
            </div>
          </>
        ) : (
          <p className="empty-tag">None detected yet</p>
        )}
      </div>

      <div className="sidebar-card">
        <span className="card-label">AI next move</span>
        <p className="next-move">
          {analysis ? (MOVE_LABELS[analysis.next_move] ?? analysis.next_move) : "Waiting for first reply"}
        </p>
      </div>

      <div className="sidebar-card">
        <span className="card-label">Teacher note</span>
        <p className="teacher-note-text">
          {analysis?.teacher_note ?? "A note will appear after the first AI reply."}
        </p>
      </div>

      {source && (
        <div className="source-badge">
          {source === "featherless" ? "✦ Powered by Featherless.ai" : "⚡ Local fallback"}
        </div>
      )}

      <div className="sidebar-card subject-card">
        <span className="card-label">Current subject</span>
        <p className="subject-name">{SUBJECTS[subject].short}</p>
      </div>
    </aside>
  );
}

export default function Home() {
  const [subject, setSubject] = useState<Subject>("circuits");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState(SUBJECTS.circuits.starter);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<Analysis | null>(null);
  const [lastSource, setLastSource] = useState<"featherless" | "fallback" | null>(null);
  const [sessionDone, setSessionDone] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function switchSubject(s: Subject) {
    setSubject(s);
    setMessages([]);
    setInput(SUBJECTS[s].starter);
    setLastAnalysis(null);
    setLastSource(null);
    setSessionDone(false);
  }

  async function sendMessage(e?: FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const apiMessages: Message[] = nextMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/socratic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, subject }),
      });

      const data: SocraticResponse = await res.json();
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.reply,
        analysis: data.analysis,
      };

      setMessages([...nextMessages, assistantMsg]);
      setLastAnalysis(data.analysis);
      setLastSource(data.source);

      if (data.analysis.progress >= 5 || data.analysis.next_move === "confirm_understanding") {
        setSessionDone(true);
      }
    } catch {
      setMessages([
        ...nextMessages,
        { role: "assistant", content: "Connection error — please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  const config = SUBJECTS[subject];

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-dot" />
          <strong>LabLens AI</strong>
          <span className="brand-sub">Socratic STEM Tutor</span>
        </div>
        <nav className="subject-nav">
          {(Object.keys(SUBJECTS) as Subject[]).map((s) => (
            <button
              key={s}
              className={`subject-btn${subject === s ? " active" : ""}`}
              onClick={() => switchSubject(s)}
              type="button"
            >
              {SUBJECTS[s].short}
            </button>
          ))}
        </nav>
      </header>

      <div className="workspace">
        <main className="chat-col">
          <div className="problem-banner">
            <span className="kicker">{config.label}</span>
            <p className="problem-text">{config.problem}</p>
          </div>

          <div className="messages">
            {messages.length === 0 && (
              <div className="empty-chat">
                <p>Type your initial reasoning below. The AI will guide you — not give you the answer.</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`bubble-wrap ${msg.role}`}>
                <div className={`bubble ${msg.role}`}>
                  <span className="bubble-label">{msg.role === "user" ? "You" : "LabLens AI"}</span>
                  <p>{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="bubble-wrap assistant">
                <div className="bubble assistant loading">
                  <span className="bubble-label">LabLens AI</span>
                  <span className="dots"><span /><span /><span /></span>
                </div>
              </div>
            )}
            {sessionDone && (
              <div className="session-complete">
                <strong>Session complete!</strong> You've worked through the misconception. Well done.
                <button type="button" onClick={() => switchSubject(subject)} className="restart-btn">
                  Start fresh
                </button>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {!sessionDone && (
            <form className="input-row" onSubmit={sendMessage}>
              <textarea
                className="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type your reasoning… (Enter to send)"
                rows={3}
              />
              <button className="send-btn" type="submit" disabled={isLoading || !input.trim()}>
                {isLoading ? "…" : "Send"}
              </button>
            </form>
          )}
        </main>

        <CognitiveSidebar analysis={lastAnalysis} source={lastSource} subject={subject} />
      </div>
    </div>
  );
}
