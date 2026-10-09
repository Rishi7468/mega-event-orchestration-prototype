"use client";

import { Eye } from "lucide-react";
import { VisualCVPipeline } from "./visuals/VisualCVPipeline";

export function CVPipelineSection() {
  return (
    <section id="cv-pipeline" className="scroll-mt-28 py-14 px-4 sm:px-8 border-b border-[#262b31] bg-[#0b0d10]">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
          <Eye className="h-4 w-4" />
          Computer Vision Perception Pipeline
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f3f4f6] tracking-tight">
          In-Browser Multi-Camera Perception Engine
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#a1a1aa] max-w-3xl leading-relaxed mb-8">
          Using `@tensorflow/tfjs` and `@tensorflow-models/coco-ssd`, Pravaah processes background canvas video frames across site cameras concurrently without blocking the main UI thread.
        </p>

        {/* VISUAL-02 Component */}
        <VisualCVPipeline />
      </div>
    </section>
  );
}
