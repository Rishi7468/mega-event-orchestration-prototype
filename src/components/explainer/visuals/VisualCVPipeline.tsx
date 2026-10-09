"use client";

import { Video, Cpu, ShieldAlert, Activity, CheckCircle2 } from "lucide-react";

export function VisualCVPipeline() {
  const cameras = [
    { id: "cam-07", name: "CAM-07 (Gate A Corridor)", zone: "central", edges: ["edge-south-gate-a", "edge-gate-a-sangam"] },
    { id: "cam-03", name: "CAM-03 (North Hub & Gate B)", zone: "north", edges: ["edge-north-gate-b", "edge-north-east"] },
    { id: "cam-12", name: "CAM-12 (East Sector Approach)", zone: "east", edges: ["edge-east-sangam"] },
    { id: "cam-04", name: "CAM-04 (South Connector Hub)", zone: "south", edges: ["edge-south-east", "edge-south-north"] },
  ];

  return (
    <div className="rounded-xl border border-[#262b31] bg-[#14171b] p-5 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#262b31] pb-4 mb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">VISUAL-02</span>
          <h3 className="text-lg font-bold text-[#f3f4f6]">Multi-Camera Perception to Graph Edge Telemetry Flow</h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
          <Activity className="h-4 w-4 animate-pulse" />
          TF.JS COCO-SSD Engine Active
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-stretch mb-6">
        {/* Step 1: Input Video Streams */}
        <div className="rounded-xl border border-[#262b31] bg-[#1b1f24] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#f3f4f6] mb-3">
              <Video className="h-4 w-4 text-blue-400" />
              1. MP4 Video Stream Ingestion
            </div>
            <div className="space-y-2">
              {cameras.map((cam) => (
                <div key={cam.id} className="flex items-center justify-between p-2.5 rounded-lg border border-[#262b31] bg-[#14171b] text-xs">
                  <div>
                    <p className="font-semibold text-[#f3f4f6]">{cam.id}</p>
                    <p className="text-[10px] text-[#a1a1aa]">{cam.name}</p>
                  </div>
                  <span className="rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-mono">
                    15 FPS Target
                  </span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-[#a1a1aa] mt-3">
            Source assets: <code className="text-[#e8eaed]">public/media/cameras/camera-01.mp4..04.mp4</code>
          </p>
        </div>

        {/* Step 2: TF.JS Canvas Worker */}
        <div className="rounded-xl border border-[#262b31] bg-[#1b1f24] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#f3f4f6] mb-3">
              <Cpu className="h-4 w-4 text-purple-400" />
              2. Browser Perception Worker
            </div>
            <div className="rounded-lg border border-[#262b31] bg-[#14171b] p-3 space-y-2 text-[11px] font-mono">
              <div className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                @tensorflow/tfjs COCO-SSD
              </div>
              <div className="text-[#a1a1aa]">→ Canvas Frame Background Sampling</div>
              <div className="text-[#a1a1aa]">→ Centroid Track Isolation (CentroidTracker)</div>
              <div className="text-amber-400 pt-1 border-t border-[#262b31]">
                Occupancy = (TrackCount × 1200 + 8000) / 35,000
              </div>
            </div>
          </div>
          <p className="text-[11px] text-[#a1a1aa] mt-3">
            Source: <code className="text-[#e8eaed]">src/lib/cv/videoPerceptionEngine.ts</code>
          </p>
        </div>

        {/* Step 3: Edge Crowd States */}
        <div className="rounded-xl border border-[#262b31] bg-[#1b1f24] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#f3f4f6] mb-3">
              <ShieldAlert className="h-4 w-4 text-emerald-400" />
              3. Graph Edge Crowd Mapping
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg border border-[#262b31] bg-[#14171b]">
                <p className="font-semibold text-[#f3f4f6]">cameraEdgeRegistry.ts</p>
                <p className="text-[10px] text-[#a1a1aa] mt-1">
                  Maps camera person counts directly to associated graph edge IDs: edge-south-gate-a, edge-gate-a-sangam, edge-east-sangam, etc.
                </p>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#14171b] text-[11px] font-mono text-[#a1a1aa] border border-[#262b31]">
                <span>Data Source Tag</span>
                <span className="text-emerald-400 font-bold">REAL_VIDEO</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-[#a1a1aa] mt-3">
            Source: <code className="text-[#e8eaed]">src/lib/cv/cameraEdgeRegistry.ts</code>
          </p>
        </div>
      </div>

      {/* Model Compatibility & Provenance Note */}
      <div className="rounded-lg border border-[#262b31] bg-[#1b1f24] p-3.5 text-xs text-[#a1a1aa]">
        <span className="font-bold text-[#f3f4f6]">Model Specification & Schema Note:</span> In-browser inference is executed via TensorFlow.js COCO-SSD (<code className="text-[#60a5fa]">lite_mobilenet_v2</code>). The telemetry payload field <code className="text-[#60a5fa]">model: &quot;yolo11&quot;</code> represents a schema compatibility tag for downstream enterprise perception servers.
      </div>
    </div>
  );
}
