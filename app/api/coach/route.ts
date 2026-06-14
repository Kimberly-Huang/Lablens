import { NextResponse } from "next/server";

type HintLevel = "nudge" | "concept" | "reasoning";
type ScenarioId = "circuits" | "calculus" | "chemistry";

type CoachRequest = {
  answer: string;
  hintLevel: HintLevel;
  attempt: number;
  scenarioId: ScenarioId;
  scenarioTitle: string;
  problem: string;
  expectedPattern: string;
  values?: Record<string, number>;
};

type CoachResponse = {
  misconception: string;
  confidence: number;
  feedback: string;
  hint: string;
  nextQuestion: string;
  reportSummary: string;
  source: "featherless" | "fallback";
};

const fallbackContent: Record<
  ScenarioId,
  {
    correctSignals: string[];
    correct: Omit<CoachResponse, "source">;
    levels: Record<HintLevel, Pick<CoachResponse, "feedback" | "hint">>;
    nextQuestion: (values?: Record<string, number>) => string;
    reportSummary: string;
    misconception: string;
  }
> = {
  circuits: {
    correctSignals: ["same", "equal", "one path", "series"],
    correct: {
      misconception: "Understands current conservation in a series circuit",
      confidence: 0.84,
      feedback:
        "Good reasoning. You are separating charge flow from energy transfer: current stays the same through a single-loop series circuit.",
      hint:
        "Now use that same current to explain why voltage drops differ across resistors.",
      nextQuestion:
        "Change one resistor and predict whether total current increases or decreases before checking the sandbox.",
      reportSummary:
        "The learner understands current conservation and is ready for voltage division."
    },
    levels: {
      nudge: {
        feedback:
          "Your answer suggests you may be treating current as something that gets used up after a resistor.",
        hint:
          "Look for the quantity that has only one path through the whole circuit."
      },
      concept: {
        feedback:
          "The likely misconception is that current decreases after each component. In a series circuit, current is the same everywhere in the loop.",
        hint:
          "Find total resistance first, then use I = V / R_total for the whole loop."
      },
      reasoning: {
        feedback:
          "Energy is transferred in each resistor, but charge is not consumed. That is why voltage drops can differ while current remains the same.",
        hint:
          "Add the resistors, compute loop current, then use V = IR for each resistor. The voltage drops should add back to the battery voltage."
      }
    },
    nextQuestion: (values) =>
      `For this ${values?.voltage ?? 12} V series circuit, what current flows through every resistor?`,
    reportSummary:
      "Likely misconception: current is consumed by components. Next step: compare current conservation with voltage division.",
    misconception: "Current is consumed by components"
  },
  calculus: {
    correctSignals: ["slope", "rate", "tangent", "2x"],
    correct: {
      misconception: "Distinguishes function value from instantaneous rate of change",
      confidence: 0.86,
      feedback:
        "Good reasoning. You are treating the derivative as slope at a point, not as the height of the graph.",
      hint:
        "Use the tangent line idea to explain why the derivative changes as x changes.",
      nextQuestion:
        "Move x to another value and predict the tangent slope before checking the value.",
      reportSummary:
        "The learner understands derivative-as-rate and is ready to compare secant and tangent slopes."
    },
    levels: {
      nudge: {
        feedback:
          "Your answer may be using the graph's height instead of the graph's slope.",
        hint:
          "At a single x-value, ask: how steep is the curve right here?"
      },
      concept: {
        feedback:
          "The likely misconception is confusing f(x), the output, with f'(x), the instantaneous rate of change.",
        hint:
          "For f(x) = x^2, the derivative rule gives f'(x) = 2x."
      },
      reasoning: {
        feedback:
          "At x = 3, f(3) = 9 tells height, while f'(3) = 6 tells slope. These answer different questions.",
        hint:
          "Use f'(x) = 2x, substitute the selected x-value, then describe the result as units of output per unit of input."
      }
    },
    nextQuestion: (values) =>
      `For f(x) = x^2 at x = ${values?.x ?? 3}, what does f'(x) represent in words?`,
    reportSummary:
      "Likely misconception: confusing function value with derivative. Next step: practice tangent slope interpretation.",
    misconception: "Function value is mistaken for derivative"
  },
  chemistry: {
    correctSignals: ["ratio", "required", "balanced", "stoichiometric", "2:1"],
    correct: {
      misconception: "Uses mole ratios to identify the limiting reactant",
      confidence: 0.83,
      feedback:
        "Good reasoning. You are comparing reactants through the balanced equation instead of comparing raw amounts.",
      hint:
        "Now explain what reactant remains in excess after the reaction stops.",
      nextQuestion:
        "Change the available O2 and predict whether H2 or O2 limits water production.",
      reportSummary:
        "The learner uses stoichiometric ratios and is ready for yield calculations."
    },
    levels: {
      nudge: {
        feedback:
          "Your answer may be comparing amounts directly instead of using the balanced equation.",
        hint:
          "The coefficients tell the reaction exchange rate between H2 and O2."
      },
      concept: {
        feedback:
          "The likely misconception is treating reactant amounts as interchangeable without the 2:1 mole ratio.",
        hint:
          "For 2H2 + O2 -> 2H2O, every 1 mole of O2 requires 2 moles of H2."
      },
      reasoning: {
        feedback:
          "A limiting reactant is the ingredient that runs out first after applying the balanced mole ratio, not necessarily the smaller number of moles.",
        hint:
          "Compare available H2 to the H2 required by O2. If required H2 is larger than available H2, H2 limits; otherwise O2 limits."
      }
    },
    nextQuestion: (values) =>
      `With ${values?.h2 ?? 4} mol H2 and ${values?.o2 ?? 3} mol O2, which reactant limits H2O production and why?`,
    reportSummary:
      "Likely misconception: comparing reactant amounts without stoichiometric ratios. Next step: identify limiting reactants from balanced equations.",
    misconception: "Reactant amounts are compared without mole ratios"
  }
};

function fallbackCoach(body: CoachRequest): CoachResponse {
  const scenario = fallbackContent[body.scenarioId] ?? fallbackContent.circuits;
  const answer = body.answer.toLowerCase();
  const seemsCorrect = scenario.correctSignals.some((signal) => answer.includes(signal));

  if (seemsCorrect) {
    return { ...scenario.correct, source: "fallback" };
  }

  const level = scenario.levels[body.hintLevel];

  return {
    misconception: scenario.misconception,
    confidence: 0.76,
    feedback: level.feedback,
    hint: level.hint,
    nextQuestion: scenario.nextQuestion(body.values),
    reportSummary: scenario.reportSummary,
    source: "fallback"
  };
}

function extractJson(text: string): Partial<CoachResponse> | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;

  try {
    return JSON.parse(match[0]) as Partial<CoachResponse>;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as CoachRequest;

  if (!body.answer || body.answer.trim().length < 2) {
    return NextResponse.json(
      { error: "Please enter a student answer before requesting feedback." },
      { status: 400 }
    );
  }

  const fallback = fallbackCoach(body);
  const apiKey = process.env.FEATHERLESS_API_KEY;
  const model = process.env.FEATHERLESS_MODEL ?? "mistralai/Mistral-Nemo-Instruct-2407";

  if (!apiKey) {
    return NextResponse.json(fallback);
  }

  try {
    const response = await fetch("https://api.featherless.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        temperature: 0.35,
        messages: [
          {
            role: "system",
            content:
              "You are LabLens AI, a STEM learning debugger. Diagnose learner misconceptions and provide minimal, scaffolded hints. Do not lead with the final answer. Return only valid JSON with keys: misconception, confidence, feedback, hint, nextQuestion, reportSummary."
          },
          {
            role: "user",
            content: `Scenario: ${body.scenarioTitle}
Problem: ${body.problem}
Expected reasoning pattern: ${body.expectedPattern}
Interactive values: ${JSON.stringify(body.values ?? {})}
Student answer: ${body.answer}
Hint level requested: ${body.hintLevel}
Attempt number: ${body.attempt}
Return concise JSON for a student-facing STEM learning product.`
          }
        ]
      })
    });

    if (!response.ok) {
      return NextResponse.json(fallback);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    const parsed = typeof content === "string" ? extractJson(content) : null;

    if (!parsed) {
      return NextResponse.json(fallback);
    }

    return NextResponse.json({
      misconception: parsed.misconception ?? fallback.misconception,
      confidence: Number(parsed.confidence ?? fallback.confidence),
      feedback: parsed.feedback ?? fallback.feedback,
      hint: parsed.hint ?? fallback.hint,
      nextQuestion: parsed.nextQuestion ?? fallback.nextQuestion,
      reportSummary: parsed.reportSummary ?? fallback.reportSummary,
      source: "featherless"
    } satisfies CoachResponse);
  } catch {
    return NextResponse.json(fallback);
  }
}
