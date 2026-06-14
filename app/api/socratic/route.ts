import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export type Message = { role: "user" | "assistant" | "system"; content: string };

export type Analysis = {
  misconception: string | null;
  confidence: number;
  progress: number; // 0-5
  next_move: string;
  teacher_note: string;
};

export type SocraticResponse = {
  reply: string;
  analysis: Analysis;
  source: "featherless" | "fallback";
};

type SubjectConfig = {
  name: string;
  problem: string;
  concept: string;
  commonMisconception: string;
  targetUnderstanding: string;
};

export const subjects: Record<string, SubjectConfig> = {
  circuits: {
    name: "Physics — Electric Circuits",
    problem:
      "A 12V battery is connected to two resistors in series: R1 = 3Ω and R2 = 6Ω. A student says the current through R2 is smaller than the current through R1 because 'some electricity gets used up by R1.' What is wrong with this reasoning?",
    concept: "Current conservation in series circuits",
    commonMisconception:
      "current-consumed: student believes current is used up or diminished by resistors",
    targetUnderstanding:
      "Current is the same at every point in a series circuit. Resistors convert electrical energy to heat, but do not consume the charge carriers (electrons).",
  },
  calculus: {
    name: "Calculus — Derivatives",
    problem:
      "For f(x) = x², a student evaluates the function at x = 3 and gets f(3) = 9. They then say 'the derivative at x = 3 is also 9 because I just plug in x = 3.' What is the misconception here?",
    concept: "Derivative as instantaneous rate of change vs. function value",
    commonMisconception:
      "output-confusion: student conflates f(x) (graph height) with f'(x) (slope at that point)",
    targetUnderstanding:
      "The derivative f'(x) is the slope of the tangent line — the instantaneous rate of change — not the output value of the function itself.",
  },
  chemistry: {
    name: "Chemistry — Stoichiometry",
    problem:
      "For the reaction 2H₂ + O₂ → 2H₂O, a student has 4 mol H₂ and 3 mol O₂. They say 'O₂ is the limiting reactant because we have fewer moles of it.' Is this correct?",
    concept: "Limiting reactant via mole ratios",
    commonMisconception:
      "raw-count: student compares raw mole quantities instead of required mole ratios from the balanced equation",
    targetUnderstanding:
      "You must use the coefficients from the balanced equation to find the required ratio. Here 2:1 means 4 mol H₂ needs exactly 2 mol O₂, so O₂ is actually in excess and H₂ limits.",
  },
};

const SYSTEM_PROMPT = (config: SubjectConfig) => `
You are a Socratic AI tutor for a student working through a STEM concept.

SUBJECT: ${config.name}
PROBLEM: ${config.problem}
CORE CONCEPT: ${config.concept}
COMMON MISCONCEPTION: ${config.commonMisconception}
TARGET UNDERSTANDING: ${config.targetUnderstanding}

YOUR RULES:
1. NEVER directly state the correct answer or the target understanding.
2. Ask one focused question per reply to probe or challenge the student's reasoning.
3. If the student shows the misconception, gently surface a contradiction with a real-world analogy or a simpler related question.
4. If the student is progressing, affirm the direction and push deeper.
5. When the student has fully articulated the correct understanding in their own words, you may confirm and summarize.
6. Keep replies short: 2-4 sentences max.

RESPONSE FORMAT — You MUST respond with valid JSON only, no prose outside the JSON:
{
  "reply": "<your Socratic question or response, 2-4 sentences>",
  "analysis": {
    "misconception": "<null if none detected, or short label like 'current-consumed'>",
    "confidence": <0.0-1.0, how confident you are in the misconception assessment>,
    "progress": <0-5 integer, 0=no engagement, 5=student fully understands>,
    "next_move": "<one of: probe_deeper | challenge_analogy | affirm_progress | confirm_understanding>",
    "teacher_note": "<one sentence for a teacher reviewing this session>"
  }
}
`.trim();

const FALLBACK: Record<string, SocraticResponse> = {
  circuits: {
    reply:
      "Interesting — you say electricity gets 'used up' by R1. Here's a question: if you have water flowing through two connected pipes, does the water disappear inside the first pipe?",
    analysis: {
      misconception: "current-consumed",
      confidence: 0.9,
      progress: 1,
      next_move: "challenge_analogy",
      teacher_note: "Student holds the current-attrition misconception; redirect with a flow analogy.",
    },
    source: "fallback",
  },
  calculus: {
    reply:
      "You plugged x = 3 into f(x) and got 9. That tells you the height of the graph at x = 3. But what do you think the derivative is actually measuring — is it a height, or something else about the curve?",
    analysis: {
      misconception: "output-confusion",
      confidence: 0.85,
      progress: 1,
      next_move: "probe_deeper",
      teacher_note: "Student conflates function value with derivative; ask about geometric meaning.",
    },
    source: "fallback",
  },
  chemistry: {
    reply:
      "You compared 4 mol vs 3 mol directly. Before deciding which runs out first, do you think you need to check how many moles of each reactant the balanced equation actually requires?",
    analysis: {
      misconception: "raw-count",
      confidence: 0.88,
      progress: 1,
      next_move: "probe_deeper",
      teacher_note: "Student skipped mole-ratio step; prompt to read the balanced equation coefficients.",
    },
    source: "fallback",
  },
};

export async function POST(req: NextRequest) {
  const { messages, subject } = (await req.json()) as {
    messages: Message[];
    subject: string;
  };

  const config = subjects[subject] ?? subjects.circuits;
  const apiKey = process.env.FEATHERLESS_API_KEY;

  if (apiKey) {
    try {
      const systemMessage: Message = { role: "system", content: SYSTEM_PROMPT(config) };
      const res = await fetch("https://api.featherless.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "Qwen/Qwen2.5-72B-Instruct",
          messages: [systemMessage, ...messages],
          temperature: 0.4,
          max_tokens: 400,
        }),
        signal: AbortSignal.timeout(12000),
      });

      if (res.ok) {
        const data = await res.json();
        const raw = data.choices?.[0]?.message?.content ?? "";
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]) as SocraticResponse;
          parsed.source = "featherless";
          return NextResponse.json(parsed);
        }
      }
    } catch {
      // fall through to fallback
    }
  }

  return NextResponse.json(FALLBACK[subject] ?? FALLBACK.circuits);
}
