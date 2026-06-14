# DSH Hacks V1 Winning Plan

## Hackathon Target

Build a meaningful technical product that leverages AI to improve STEM education.

Deadline: June 14, 2026, 11:45pm CDT.

Submission assets required:

- Interactive website, app, or coding prototype
- Demo video
- One-page project description PDF
- GitHub repository or code PDF

Judging criteria:

- Idea
- Implementation
- Design
- Presentation

## Winning Standard

Our project should meet these standards before submission.

### 1. Pain Point Is Specific

Weak projects say: "AI helps students learn better."

Winning projects say: "Students get stuck because they do not know what concept they misunderstood, and teachers cannot provide instant individualized diagnosis for every learner."

Standard:

- The user problem is specific enough to explain in 15 seconds.
- The target user is clear.
- The project solves a real learning bottleneck, not just content generation.
- The demo shows before-and-after improvement.

### 2. AI Is Necessary

Weak projects use AI as a chatbot wrapper.

Winning projects use AI for a task that rule-based software handles poorly: diagnosis, adaptation, explanation, feedback, generation, or personalization.

Standard:

- AI has a clear job beyond answering questions.
- The AI output changes based on learner behavior.
- The product shows personalized feedback or adaptive next steps.
- The project can explain why AI improves the experience.

### 3. Product Is Interactive

Weak projects are static pages with generated text.

Winning projects let users do something, get feedback, and continue.

Standard:

- User can enter a STEM problem or choose a learning scenario.
- User receives step-by-step guidance.
- User answers questions or interacts with a simulation.
- System diagnoses mistakes and recommends next action.

### 4. Technical Depth Is Visible

Weak projects hide all complexity behind one API call.

Winning projects make the implementation feel engineered.

Standard:

- There is a structured learner model or state machine.
- The app separates concept diagnosis, hint generation, and practice generation.
- There is at least one non-trivial UI interaction, visualization, or simulation.
- The codebase can be explained cleanly in the demo.

### 5. Design Feels Built For Students

Weak projects look like generic dashboards.

Winning projects reduce anxiety and help students recover from mistakes.

Standard:

- The interface is calm, clear, and fast to understand.
- Feedback is actionable, not judgmental.
- The learning flow is obvious without instructions.
- The project works well on a laptop screen during judging.

### 6. Real-World Impact Is Plausible

Weak projects claim they will change all education.

Winning projects make a credible claim about one learner group or one classroom workflow.

Standard:

- We identify a realistic adoption scenario.
- We explain who benefits: students, teachers, tutors, or underserved learners.
- We avoid exaggerated claims.
- We define what success would be measured by.

### 7. Presentation Is Demo-First

Weak presentations explain architecture before the problem.

Winning presentations show the problem, then prove the product solves it.

Standard:

- Demo has a memorable student story.
- The first 30 seconds establish the pain.
- The next 60 seconds show the working product.
- The final 30 seconds explain AI, impact, and future expansion.

## Recommended Product

Project name: LabLens AI

One-line pitch:

LabLens AI is an adaptive STEM learning coach that turns a confusing physics or math problem into a guided diagnostic lesson with hints, visualizations, mistake detection, and personalized follow-up practice.

Core pain point:

Many students do not only need the final answer. They need to know exactly where their reasoning broke. In STEM classes, a teacher may not have time to diagnose every student's misconception in real time. Generic AI tutors often answer too much too quickly, which can reduce learning instead of improving it.

Target user:

Middle school, high school, or early college students learning STEM topics independently.

Initial subject focus:

High school physics, specifically electric circuits.

Why this focus is strong:

- Circuits are visual and easy to demonstrate.
- Students commonly confuse voltage, current, resistance, and series/parallel relationships.
- The product can include a simple interactive circuit visualization.
- The demo can show clear misconception diagnosis.
- It is narrow enough to build quickly but still meaningful.

## Product Concept

The student selects or enters a circuit problem. LabLens AI guides the student through reasoning instead of giving the final answer immediately.

The app:

1. Identifies the target concept.
2. Asks one diagnostic question.
3. Detects likely misconception from the student's answer.
4. Gives a hint matched to the mistake.
5. Shows a simple visual model.
6. Generates a follow-up practice question.
7. Summarizes what the student learned.

## MVP Requirements

### Must Have

- Landing directly into the app experience
- Topic selector with "Electric Circuits"
- Sample circuit problem
- Student answer input
- AI-style diagnostic feedback
- Step-by-step hint flow
- Simple circuit visualization
- Follow-up practice question
- Progress summary
- Polished Devpost-ready UI

### Should Have

- Ability to choose hint level: small hint, stronger hint, reveal reasoning
- Misconception tags, such as "confuses current and voltage"
- Teacher-facing summary card
- Exportable learning report

### Nice To Have

- Real LLM integration
- Multiple STEM topics
- Image upload for handwritten problems
- User accounts
- Long-term learning history

For this hackathon, we should not build accounts, broad topic coverage, or complex uploads unless the MVP is already complete.

## AI Scope

If API time or reliability is limited, the MVP can use a hybrid AI simulation:

- Predefined sample problems
- Structured misconception detection
- Generated-style explanations
- Clear architecture showing where an LLM would plug in

Preferred if time allows:

- Use an LLM to generate hints and follow-up questions from a structured prompt.
- Keep deterministic guardrails for concept tags and UI flow.

The product should never simply return the final answer first.

## Featherless AI Integration Decision

The sponsor-provided Featherless.ai platform is a good fit for this project if we use it for the product's core learning loop rather than as a generic chatbot.

Recommended use:

- Misconception diagnosis from the student's answer
- Socratic hint generation at three levels
- Follow-up practice question generation
- Teacher-ready learning report generation

Do not use it for:

- Immediately giving the final answer
- Long generic explanations
- Uncontrolled free-form tutoring that can derail the demo

Implementation approach:

- Store the API key only in an environment variable.
- Call the `/v1/chat/completions` endpoint through an OpenAI-compatible client.
- Keep a deterministic fallback so the demo still works if the API is slow or unavailable.
- Use structured prompts that return JSON-like fields: misconception, confidence, hint, next_question, report_summary.

Recommended model path:

- Start with a fast instruct model for the demo flow.
- Upgrade to a stronger reasoning model only if latency is acceptable.
- Avoid depending on gated models during the live demo unless already unlocked and tested.

Why this helps the submission:

- It strengthens implementation because the product has a real AI backend.
- It strengthens presentation because we can say the AI is used specifically for diagnosis and adaptive feedback.
- It may help with sponsor alignment, but it should not become the project's main story.

## Scorecard

| Criterion | What Judges Want | Our Answer |
| --- | --- | --- |
| Idea | Innovative, on-theme, impactful | Adaptive misconception diagnosis for STEM learning |
| Implementation | Working, technically meaningful | Guided learning state machine, AI feedback, visualization |
| Design | Clear, thoughtful UX | Student-first interface with hint levels and progress |
| Presentation | Clear problem and solution | Demo one student moving from confusion to understanding |

## Demo Story

Student: Maya is studying circuits and keeps thinking that current gets "used up" after passing through a resistor.

Demo:

1. Maya opens LabLens AI and chooses Electric Circuits.
2. She answers a diagnostic question incorrectly.
3. The system detects the misconception: "current is consumed by components."
4. LabLens shows a circuit visualization and explains that current is the same through components in a series circuit.
5. Maya requests a small hint instead of the full answer.
6. She tries a follow-up question and improves.
7. The app generates a short learning report for Maya or her teacher.

Why this wins:

- The problem is concrete.
- The AI has a clear educational role.
- The demo shows interaction and improvement.
- The product is feasible in the remaining time.

## Build Plan

### Phase 1: Product Skeleton

- Create a single-page web app.
- Build the main learner flow.
- Add topic selector, problem card, answer input, hint controls, visualization panel, and progress panel.

### Phase 2: Learning Engine

- Define misconception tags.
- Add deterministic diagnosis for the demo problem.
- Add hint levels.
- Add follow-up practice generation.

### Phase 3: AI Layer

- Add LLM prompt structure if available.
- Keep fallback responses so the demo works without external API failure.
- Make AI behavior explainable in the Devpost writeup.

### Phase 4: Polish

- Improve visual hierarchy.
- Add crisp microcopy.
- Make demo path reliable.
- Test on desktop viewport.

### Phase 5: Submission Assets

- Write Devpost description.
- Create one-page PDF.
- Record demo video.
- Prepare GitHub README.

## Go / No-Go Decision

We should proceed with LabLens AI if we accept these constraints:

- Focus only on Electric Circuits for the demo.
- Prioritize a complete learning loop over many topics.
- Build a reliable prototype first, then add real API integration if time allows.
- Present the product as an adaptive STEM learning coach, not a generic chatbot.

Recommendation: Go.
