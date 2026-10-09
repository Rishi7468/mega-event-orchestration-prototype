"use client";

import { Code2 } from "lucide-react";

export function TechStackSection() {
  const stack = [
    { name: "Next.js", version: "16.3.4 (Turbopack)", role: "App Router framework, static page generation, SSE API endpoints", path: "src/app/" },
    { name: "React", version: "19.2.8", role: "Core UI framework with server & client component architecture", path: "src/components/" },
    { name: "Zustand", version: "5.0.15", role: "Global state stores (simulationStore, visitorStore, eventAuthoringStore)", path: "src/store/" },
    { name: "Leaflet", version: "1.9.4", role: "Interactive maps, sector polygon overlays, route polylines, custom pins", path: "src/components/map/" },
    { name: "@turf/turf", version: "7.4.0", role: "Geospatial polygon calculations, bounding boxes, centroid resolution", path: "src/lib/spatial/" },
    { name: "h3-js", version: "4.5.0", role: "Hexagonal spatial index utilities for high-density zone partitioning", path: "src/lib/spatial/" },
    { name: "@tensorflow/tfjs", version: "4.22.0", role: "In-browser machine learning runtime for object detection worker", path: "src/lib/cv/" },
    { name: "@tensorflow-models/coco-ssd", version: "2.2.3", role: "Pretrained COCO-SSD object detection model for real-time person count", path: "src/lib/cv/" },
    { name: "Lucide React", version: "1.39.0", role: "Icon system across operator and visitor interfaces", path: "src/components/" },
    { name: "Tailwind CSS", version: "4.0", role: "Utility styling with CSS variable design tokens", path: "src/app/globals.css" },
  ];

  return (
    <section id="tech-stack" className="scroll-mt-28 py-14 px-4 sm:px-8 border-b border-[#262b31] bg-[#0b0d10]">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
          <Code2 className="h-4 w-4" />
          Technology Stack
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f3f4f6] tracking-tight">
          Modern Frameworks & Specialized Libraries
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#a1a1aa] max-w-3xl leading-relaxed mb-8">
          Every library in Pravaah was selected for high execution speed, zero unnecessary runtime bloat, and strict type safety.
        </p>

        <div className="rounded-xl border border-[#262b31] bg-[#14171b] overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-4 bg-[#1b1f24] border-b border-[#262b31] p-4 text-xs font-bold text-[#f3f4f6]">
            <div>Library</div>
            <div>Version</div>
            <div>Role in Pravaah</div>
            <div>Primary Location</div>
          </div>
          <div className="divide-y divide-[#262b31] text-xs">
            {stack.map((item, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-4 p-4 gap-2 hover:bg-[#1b1f24]/50 transition-colors">
                <div className="font-bold text-[#f3f4f6]">{item.name}</div>
                <div className="font-mono text-emerald-400">{item.version}</div>
                <div className="text-[#a1a1aa]">{item.role}</div>
                <div className="font-mono text-[11px] text-[#9aa1a9]">{item.path}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
