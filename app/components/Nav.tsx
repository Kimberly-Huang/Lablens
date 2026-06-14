"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/subjects", label: "Subjects" },
  { href: "/demo", label: "Demo" },
  { href: "/technology", label: "Technology" },
  { href: "/product", label: "Product" },
];

export default function Nav() {
  const path = usePathname();
  const isActive = (href: string) =>
    href === "/" ? path === "/" : path.startsWith(href);

  return (
    <nav className="nav">
      <Link href="/" className="nav-logo">LabLens</Link>
      <div className="nav-links">
        {LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`nav-link ${isActive(href) ? "active" : ""}`}
          >
            {label}
          </Link>
        ))}
        <div className="nav-badge">
          <span className="nav-badge-dot" />
          Featherless.ai · Live
        </div>
      </div>
    </nav>
  );
}
