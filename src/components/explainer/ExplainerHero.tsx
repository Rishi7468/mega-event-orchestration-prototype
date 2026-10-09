"use client";

import Link from "next/link";
import { Monitor, Smartphone, Cpu, ShieldCheck, FileText } from "lucide-react";
import { BrandWordmark } from "@/components/shared/BrandWordmark";

export function ExplainerHero() {
  const navLinks = [
    { label: "Product Strategy", href: "#product-design" },
    { label: "Architecture", href: "#architecture" },
    { label: "CV Pipeline", href: "#cv-pipeline" },
    { label: "Pedestrian Graph", href: "#pedestrian-graph" },
    { label: "Itinerary", href: "#itinerary-optimizer" },
    { label: "State Sync", href: "#state-sync" },
    { label: "Decisions", href: "#decisions" },
    { label: "Worked Scenario", href: "#worked-example" },
    { label: "Production Arch", href: "#production-architecture" },
    { label: "Cost Model", href: "#cost-model" },
    { label: "Future Roadmap", href: "#expanded-roadmap" },
    { label: "Data Provenance", href: "#data-provenance" },
    { label: "Tech Stack", href: "#tech-stack" },
    { label: "Technical FAQ", href: "#faq" },
  ];

  return (
    <header className="relative border-b border-[#262b31] bg-[#0b0d10] pt-10 pb-12 px-4 sm:px-8">
      {/* Background Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-64 bg-blue-600/10 blur-3xl pointer-events-none rounded-full" />

      <div className="mx-auto max-w-6xl relative z-10">
        {/* Header Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#262b31] pb-5 mb-8">
          <Link href="/" className="flex items-center gap-3">
            <BrandWordmark />
            <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-[#14171b] border border-[#262b31] text-[#9aa1a9]">
              System Architecture & Intelligence Report
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/visitor"
              className="inline-flex items-center gap-2 rounded-lg border border-[#262b31] bg-[#14171b] px-3.5 py-2 text-xs font-semibold text-[#f3f4f6] hover:bg-[#1b1f24] hover:border-blue-500/50 transition-all"
            >
              <Smartphone className="h-4 w-4 text-amber-400" />
              Visitor App
            </Link>
            <Link
              href="/operator"
              className="inline-flex items-center gap-2 rounded-lg border border-blue-500/40 bg-blue-500/10 px-3.5 py-2 text-xs font-semibold text-blue-400 hover:bg-blue-500/20 transition-all"
            >
              <Monitor className="h-4 w-4 text-blue-400" />
              Command Center
            </Link>
          </div>
        </div>

        {/* Hero Title & Intro */}
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 mb-4">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verified Source-Backed Architecture Document
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#f3f4f6] leading-tight">
            Inside Pravaah — Architecture, Intelligence & System Design
          </h1>

          <p className="mt-4 text-base sm:text-lg text-[#a1a1aa] leading-relaxed max-w-3xl">
            A deep technical breakdown of the multi-camera perception pipeline, event-aware pedestrian graph routing engine, and dual-surface state synchronization model powering Pravaah at mega-event scale.
          </p>
        </div>

        {/* Technical Fact Badges */}
        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 rounded-md border border-[#262b31] bg-[#14171b] px-3 py-1.5 text-[#9aa1a9]">
            <Cpu className="h-3.5 w-3.5 text-blue-400" />
            <span>TF.js COCO-SSD Worker Engine</span>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-[#262b31] bg-[#14171b] px-3 py-1.5 text-[#9aa1a9]">
            <FileText className="h-3.5 w-3.5 text-emerald-400" />
            <span>8-Node / 9-Edge Pedestrian Graph</span>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-[#262b31] bg-[#14171b] px-3 py-1.5 text-[#9aa1a9]">
            <Monitor className="h-3.5 w-3.5 text-purple-400" />
            <span>13 Routing Pair Candidate Pools</span>
          </div>
        </div>

        {/* Sticky Table of Contents */}
        <nav className="mt-8 sticky top-4 z-40 rounded-xl border border-[#262b31] bg-[#14171b]/95 p-2.5 backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-2 text-xs font-medium text-[#9aa1a9] overflow-x-auto app-scroll">
            <span className="text-[#60a5fa] font-bold px-2 py-1 uppercase tracking-wider text-[10px] shrink-0">
              Contents:
            </span>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded-md text-[#e8eaed] hover:bg-[#1b1f24] hover:text-blue-400 transition-colors shrink-0"
              >
                {link.label}
              </a>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
