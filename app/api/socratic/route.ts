import { NextRequest, NextResponse } from "next/server";


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
  biology: {
    name: "Biology — Cell Osmosis",
    problem:
      "A red blood cell is placed in a saltwater solution. A student says: 'Water moves out of the cell because salt attracts water and pulls it across the membrane.' What is wrong with this explanation?",
    concept: "Osmosis as passive diffusion of water down its own concentration gradient",
    commonMisconception:
      "solute-attraction: student believes solutes actively attract or pull water molecules rather than water moving by diffusion",
    targetUnderstanding:
      "Osmosis is the diffusion of water from high water concentration (low solute) to low water concentration (high solute) through a semipermeable membrane. Water moves passively down its own gradient — no attraction involved.",
  },
  mechanics: {
    name: "Mechanics — Newton's Third Law",
    problem:
      "A truck collides with a small bug. A student claims the truck exerts a much larger force on the bug than the bug exerts on the truck, because the truck is heavier. Is this correct?",
    concept: "Newton's Third Law — action-reaction pairs are always equal in magnitude",
    commonMisconception:
      "mass-determines-force: student believes the larger or heavier object exerts a greater interaction force",
    targetUnderstanding:
      "By Newton's Third Law, the bug exerts the same force on the truck as the truck exerts on the bug — equal in magnitude, opposite in direction. What differs is acceleration (a = F/m), not force.",
  },
  algebra: {
    name: "Algebra — Quadratic Functions",
    problem:
      "For x² - 5x + 6 = 0, a student says the roots are x = 5 and x = 6 because they can 'read the numbers off' the equation. What is the misconception?",
    concept: "Finding roots requires solving (factoring or quadratic formula), not reading coefficients",
    commonMisconception:
      "coefficient-reading: student treats the numerical coefficients as if they were the solutions directly",
    targetUnderstanding:
      "Roots are found by solving: x² - 5x + 6 = (x-2)(x-3) = 0, giving x = 2 and x = 3. The coefficients -5 and +6 are not the roots — they encode the sum and product of the roots respectively.",
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
  biology: {
    reply:
      "You say salt 'attracts' water. Does salt actually exert a physical force pulling water molecules — or might the water be moving for a different reason related to concentration?",
    analysis: {
      misconception: "solute-attraction",
      confidence: 0.87,
      progress: 1,
      next_move: "probe_deeper",
      teacher_note: "Student anthropomorphizes solute; redirect toward diffusion and concentration gradient.",
    },
    source: "fallback",
  },
  mechanics: {
    reply:
      "You say the truck pushes harder because it's bigger. Newton's Third Law says something specific about paired forces — do you remember what it says about their magnitudes?",
    analysis: {
      misconception: "mass-determines-force",
      confidence: 0.91,
      progress: 1,
      next_move: "probe_deeper",
      teacher_note: "Student conflates force with mass; redirect to Third Law statement.",
    },
    source: "fallback",
  },
  algebra: {
    reply:
      "You read x = 5 and x = 6 from the coefficients. Let's check: if x = 6 is a root, it must satisfy the equation. Does 6² - 5(6) + 6 equal zero?",
    analysis: {
      misconception: "coefficient-reading",
      confidence: 0.93,
      progress: 1,
      next_move: "challenge_analogy",
      teacher_note: "Student reads coefficients as roots; use substitution check to expose the error.",
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
