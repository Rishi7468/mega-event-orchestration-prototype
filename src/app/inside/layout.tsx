import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inside Pravaah — Architecture, Intelligence & System Design",
  description:
    "A deep technical breakdown of the multi-camera perception pipeline, event-aware pedestrian graph routing engine, and dual-surface synchronization architecture powering Pravaah.",
};

export default function ExplainerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="operator-theme min-h-dvh bg-[#0b0d10] text-[#f3f4f6] selection:bg-blue-500/30 selection:text-blue-200 font-sans antialiased scroll-smooth">
      {children}
    </div>
  );
}
