import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LabLens AI — Socratic STEM Tutor",
  description: "An AI Socratic tutor that guides students through STEM misconceptions — powered by Featherless.ai."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
