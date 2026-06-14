import Link from "next/link";
import Nav from "../components/Nav";

const SUBJECTS = [
  {
    id: "circuits",
    label: "Physics",
    name: "Electric Circuits",
    desc: "Series circuits, current, voltage — and why resistors don't 'use up' electricity.",
    photo: "/subjects/circuits.jpg",
  },
  {
    id: "calculus",
    label: "Calculus",
    name: "Derivatives",
    desc: "What f′(x) actually measures — and why it's not the same as plugging into f(x).",
    photo: "/subjects/calculus.jpg",
  },
  {
    id: "chemistry",
    label: "Chemistry",
    name: "Stoichiometry",
    desc: "Limiting reactants, mole ratios — why comparing raw moles is the wrong move.",
    photo: "/subjects/chemistry.jpg",
  },
  {
    id: "biology",
    label: "Biology",
    name: "Cell Osmosis",
    desc: "Why water moves across membranes — and what 'concentration' really means here.",
    photo: "/subjects/biology.jpg",
  },
  {
    id: "mechanics",
    label: "Mechanics",
    name: "Newton's Laws",
    desc: "Action-reaction pairs — why a truck and a bug exert the same force on each other.",
    photo: "/subjects/mechanics.jpg",
  },
  {
    id: "algebra",
    label: "Algebra",
    name: "Quadratic Functions",
    desc: "Why the roots of x² - 5x + 6 are not found by plugging in x = 5 or x = 6.",
    photo: "/subjects/algebra.jpg",
  },
];

export default function SubjectsPage() {
  return (
    <>
      <Nav />
      <div className="subjects-page">
        <span className="eyebrow">Choose a module</span>
        <h1>Where does your<br />reasoning need work?</h1>
        <p className="subjects-sub">
          Six classic misconceptions. Each one is more common than you think.
          Pick a subject and start explaining — honestly.
        </p>

        <div className="subject-grid">
          {SUBJECTS.map((s) => (
            <Link key={s.id} href={`/tutor/${s.id}`} className="subject-card">
              <div
                className="subject-card-bg"
                style={{ backgroundImage: `url(${s.photo})` }}
              />
              <div className="subject-card-body">
                <div className="subject-card-label">{s.label}</div>
                <div className="subject-card-name">{s.name}</div>
                <div className="subject-card-desc">{s.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
