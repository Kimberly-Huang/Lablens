# LabLens AI 🔬

**A Socratic STEM tutor that diagnoses misconceptions — not just answers questions.**

> **Understanding is not recall.** LabLens guides students to the insight themselves; it never gives the answer first.

Students interact with live mini-labs, explain their thinking, and receive a targeted hint tied to the exact misconception detected — not a generic explanation. A follow-up check verifies whether the misconception was actually repaired, and a teacher-ready report summarizes the cognitive gap and next step.

Built in 36 hours at **DSH Hacks V1** by a team of two.

---

## 🔗 Quick Links

|                   |                                                                       |
| ----------------- | --------------------------------------------------------------------- |
| 🎥 **Demo Video** | [youtu.be/TtZT0p-GlPQ](https://www.youtube.com/watch?v=TtZT0p-GlPQ) |
| 🌐 **Live Demo**  | [lablens-gules.vercel.app](https://lablens-gules.vercel.app/)        |
| 📁 **DevPost**    | [dsh-hacks-v1.devpost.com](https://dsh-hacks-v1.devpost.com/)        |

---

## The Problem

STEM students don't fail because they lack answers — they fail because they hold the *wrong mental model* and never realize it. A student who believes "current gets used up across resistors" will keep making the same mistake no matter how many times they read the correct explanation. Traditional tutoring tools (ChatGPT, Wolfram Alpha, Khan Academy) detect the *wrong answer* and deliver the *right answer*. None of them pinpoint the underlying cognitive misconception and force the student to reason past it.

## Our Answer

LabLens separates **diagnosing** from **correcting**:

- A **live mini-lab** lets students manipulate variables (circuit voltages, reaction ratios, function inputs) *before* typing anything — their lab choices already reveal their mental model.
- A **Socratic AI engine** (Qwen 2.5-72B via Featherless.ai) reads the student's explanation *and* their lab behavior, classifies the exact misconception, and issues a *targeted hint* — never the full answer.
- A **follow-up check** asks a structurally identical question. If the student answers correctly, the misconception is marked repaired. If not, the hint deepens by one level.
- A **teacher report** summarizes the diagnosed misconception, the hint chain used, and the recommended next step — exportable for classroom review.

The AI never lectures. It asks the question that forces the student to find the gap themselves.

---

## Architecture

```
  STUDENT INPUT                          SOCRATIC ENGINE (Featherless.ai)
  Mini-lab interaction                   Qwen/Qwen2.5-72B-Instruct
       │                                        │
       │  Live parameter controls               │  System prompt encodes:
       │  (voltage, moles, derivatives)         │  misconception taxonomy
       ▼                                        ▼  + Socratic hint ladder
 ┌─────────────────────────────────────────────────────────────────────────┐
 │  Next.js App Router   ·   /app/api/chat   ·   Vercel Edge               │
 │                                                                          │
 │  Request pipeline:                                                       │
 │   1. Student submits explanation + lab state                             │
 │   2. API route calls Featherless (OpenAI-compatible endpoint)            │
 │   3. Model returns: { misconception, hint, chips, next_move }            │
 │   4. UI renders targeted hint + cognitive progress chips                 │
 │   5. Follow-up check re-enters pipeline at deeper hint level             │
 └─────────────────────────────────────────────────────────────────────────┘
        │                          │                          │
 ┌──────┴──────┐          ┌────────┴───────┐         ┌───────┴──────────┐
 │  Physics     │          │  Calculus       │         │  Chemistry        │
 │  Series      │          │  Derivative     │         │  Limiting         │
 │  circuits    │          │  vs. value      │         │  reactants        │
 └─────────────┘          └────────────────┘         └──────────────────┘
```

### System components

| Layer         | Module            | Tech                               | Role                                                                         |
| ------------- | ----------------- | ---------------------------------- | ---------------------------------------------------------------------------- |
| Frontend      | `app/`            | Next.js 15 · React 19 · App Router | Mini-labs, chat UI, hint chips, teacher report                               |
| API           | `app/api/chat/`   | Next.js Route Handler              | Proxies to Featherless.ai; injects misconception taxonomy into system prompt |
| AI model      | Featherless.ai    | Qwen/Qwen2.5-72B-Instruct          | Socratic classification + targeted hint generation                           |
| Demo subjects | `app/demo/`       | React components                   | Three interactive mini-labs with live parameter controls                     |
| Pages         | `app/product/` …  | Static Next.js pages               | Landing, subjects overview, technology explainer                             |
| Deployment    | Vercel            | Edge runtime                       | Zero-config deploy; API key injected via environment variable                |

---

## Subjects Covered

| Subject   | Misconception targeted                       | Lab interaction                           |
| --------- | -------------------------------------------- | ----------------------------------------- |
| Physics   | Current "consumed" across series resistors    | Adjust voltage & resistors; read ammeter  |
| Calculus  | Derivative = function value at a point        | Drag tangent line; observe slope vs. y    |
| Chemistry | Excess reagent limits the reaction            | Set mole ratios; watch yield plateau      |

More subjects (Biology, Statistics, Mechanics) are planned for the next sprint.

---

## Local Setup

```bash
git clone https://github.com/Kimberly-Huang/Lablens.git
cd Lablens
npm install
```

Create `.env.local`:

```env
FEATHERLESS_API_KEY=your_key_here
```

```bash
npm run dev
# → http://localhost:3000
```

If no API key is present, the app uses a deterministic fallback coach so the demo still runs offline.

## Deployment (Vercel)

1. Push to GitHub.
2. Import repo at [vercel.com/new](https://vercel.com/new).
3. Add `FEATHERLESS_API_KEY` under **Settings → Environment Variables**.
4. Deploy — no other configuration needed.

---

## Honest Limitations

- **Three subjects only.** The misconception taxonomy is hand-authored for Physics, Calculus, and Chemistry. Expanding to new subjects requires writing a new taxonomy entry and mini-lab component.
- **Single-session memory.** The hint chain resets on page refresh; there is no persistent student profile or learning history across sessions.
- **No curriculum alignment.** Misconceptions are mapped to concepts, not to specific standards (e.g., AP Physics curriculum units). A production version would tag each misconception to a standard code.
- **AI confidence is opaque.** The model returns a classification and hint but no confidence score; a low-confidence classification silently uses the same hint ladder as a high-confidence one.

## Future Work

- **Persistent student profiles** — track misconception history across sessions; flag recurring gaps for teacher review.
- **Curriculum-aligned taxonomy** — tag each misconception to AP / IB / Common Core codes so the teacher report maps directly to standards.
- **Adaptive hint depth** — use confidence scoring to decide whether to deepen the hint or try a different Socratic angle.
- **More subjects** — Biology (cell membrane transport), Statistics (p-value misinterpretation), Mechanics (Newton's Third Law symmetry).
- **Classroom dashboard** — aggregate misconception heatmaps across a class cohort in real time.

## Team

Two builders: Kimberly Huang, Kylin Hwang

---

*The AI diagnoses. The student discovers. The teacher sees everything.*
