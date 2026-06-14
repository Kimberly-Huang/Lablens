# LabLens AI

LabLens AI is a STEM learning debugger built for DSH Hacks V1. Instead of giving students the final answer first, it diagnoses misconceptions, gives a targeted hint, visualizes the concept, and generates follow-up practice.

## Core Demo

The MVP includes three interactive STEM misconception demos:

- Physics: series-circuit current conservation.
- Calculus: derivative meaning versus function value.
- Chemistry: limiting reactants and mole ratios.
- Students adjust a live mini-lab before explaining their thinking.
- LabLens diagnoses the misconception and provides a progressively deeper hint.
- A follow-up answer check verifies whether the misconception was repaired.
- A teacher-ready learning report summarizes the misconception and next step.

## Local Setup

```bash
npm install
npm run dev
```

Create `.env.local` for Featherless AI:

```bash
FEATHERLESS_API_KEY=your_key_here
FEATHERLESS_MODEL=mistralai/Mistral-Nemo-Instruct-2407
```

If no API key is present, the app uses a deterministic fallback coach so the demo still works.

## Vercel

Add the same environment variables in Vercel Project Settings before deploying.
