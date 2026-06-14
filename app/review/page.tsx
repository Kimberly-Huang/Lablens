"use client";

import { useEffect, useState } from "react";

type SessionRecord = {
  subject: string;
  misconception: string | null;
  progress: number;
  timestamp: string;
};

export default function ReviewPage() {
  const [records, setRecords] = useState<SessionRecord[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("lablens-sessions");
    if (stored) setRecords(JSON.parse(stored) as SessionRecord[]);
  }, []);

  return (
    <main style={{ padding: "40px 24px", maxWidth: 600, margin: "0 auto" }}>
      <a href="/" style={{ color: "var(--accent)", fontSize: 13, textDecoration: "none" }}>← Back to tutor</a>
      <h1 style={{ marginTop: 16, marginBottom: 24 }}>Learning Review</h1>
      {records.length === 0 ? (
        <p style={{ color: "var(--text3)" }}>No sessions recorded yet. Complete a session on the main page.</p>
      ) : (
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
          {records.map((r, i) => (
            <li key={i} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}>
              <strong>{r.subject}</strong>
              <p style={{ color: "var(--text2)", marginTop: 4 }}>{r.misconception ?? "No misconception flagged"}</p>
              <p style={{ color: "var(--text3)", fontSize: 12, marginTop: 6 }}>Progress: {r.progress}/5 · {new Date(r.timestamp).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
