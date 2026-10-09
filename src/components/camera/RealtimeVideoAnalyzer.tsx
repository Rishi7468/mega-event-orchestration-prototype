"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Eye, Pause, Play, ShieldAlert, Video, Zap } from "lucide-react";
import {
  globalVideoPerceptionEngine,
  PERCEPTION_CONFIG,
  type DetectedPerson,
  type RealtimeTrack,
} from "@/lib/cv/videoPerceptionEngine";
import { CAMERA_EDGE_REGISTRY } from "@/lib/cv/cameraEdgeRegistry";
import { useSimulationStore } from "@/store/simulationStore";
import { computeZoneCrowdState } from "@/lib/intelligence/crowdStateEngine";

export type MultiCameraConfig = {
  id: string;
  name: string;
  zoneId: string;
  src: string;
  coverageArea: string;
  mappedEdges: string[];
};

export const ALL_CAMERA_CONFIGS: MultiCameraConfig[] = [
  {
    id: "cam-07",
    name: "CAM-07 (Main Corridor)",
    zoneId: "central",
    src: "/media/cameras/camera-01.mp4",
    coverageArea: "Main corridor → Gate A approach",
    mappedEdges: CAMERA_EDGE_REGISTRY["cam-07"]?.associatedEdgeIds ?? [
      "edge-south-gate-a",
      "edge-gate-a-sangam",
      "edge-gate-b-sangam",
    ],
  },
  {
    id: "cam-03",
    name: "CAM-03 (North Transit Hub)",
    zoneId: "north",
    src: "/media/cameras/camera-02.mp4",
    coverageArea: "Triveni Marg hub forecourt",
    mappedEdges: CAMERA_EDGE_REGISTRY["cam-03"]?.associatedEdgeIds ?? [
      "edge-north-gate-b",
      "edge-north-east",
    ],
  },
  {
    id: "cam-12",
    name: "CAM-12 (East Sector Approach)",
    zoneId: "east",
    src: "/media/cameras/camera-03.mp4",
    coverageArea: "East arterial approach road",
    mappedEdges: CAMERA_EDGE_REGISTRY["cam-12"]?.associatedEdgeIds ?? [
      "edge-east-sangam",
    ],
  },
  {
    id: "cam-04",
    name: "CAM-04 (South Connector Hub)",
    zoneId: "south",
    src: "/media/cameras/camera-04.mp4",
    coverageArea: "South arterial connector corridor",
    mappedEdges: CAMERA_EDGE_REGISTRY["cam-04"]?.associatedEdgeIds ?? [
      "edge-south-east",
      "edge-south-north",
    ],
  },
];

type CameraRuntimeMetrics = {
  tracks: RealtimeTrack[];
  detections: DetectedPerson[];
  processingTimeMs: number;
  fps: number;
  confidence: number;
  lastFrameAt: number | null;
  totalFrames: number;
  isAvailable: boolean;
};

export function RealtimeVideoAnalyzer() {
  const [selectedCamId, setSelectedCamId] = useState<string>("cam-07");
  const [isEngineReady, setIsEngineReady] = useState(false);

  // Per-camera analysis toggle (ON/OFF)
  const [analysisEnabled, setAnalysisEnabled] = useState<Record<string, boolean>>({
    "cam-07": true,
    "cam-03": true,
    "cam-12": true,
    "cam-04": true,
  });

  // Per-camera video source state (Available vs Offline)
  const [videoAvailable, setVideoAvailable] = useState<Record<string, boolean>>({
    "cam-07": true,
    "cam-03": true,
    "cam-12": true,
    "cam-04": false, // Checked dynamically on load
  });

  // Per-camera telemetry state
  const [cameraMetrics, setCameraMetrics] = useState<Record<string, CameraRuntimeMetrics>>(() => {
    const initial: Record<string, CameraRuntimeMetrics> = {};
    ALL_CAMERA_CONFIGS.forEach((cam) => {
      initial[cam.id] = {
        tracks: [],
        detections: [],
        processingTimeMs: 0,
        fps: 0,
        confidence: 0,
        lastFrameAt: null,
        totalFrames: 0,
        isAvailable: true,
      };
    });
    return initial;
  });

  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);
  const lastProcessTimes = useRef<Record<string, number>>({});
  const fpsFrameCounters = useRef<Record<string, number>>({});
  const fpsLastCalcTimes = useRef<Record<string, number>>({});

  const selectedCamConfig =
    ALL_CAMERA_CONFIGS.find((c) => c.id === selectedCamId) ?? ALL_CAMERA_CONFIGS[0];

  // Initialize TensorFlow.js Model on Mount
  useEffect(() => {
    let isMounted = true;
    globalVideoPerceptionEngine.initializeModel().then((success) => {
      if (isMounted) {
        setIsEngineReady(success);
      }
    });

    return () => {
      isMounted = false;
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  // Monitor Video Loading Errors per camera (Part N & P)
  const handleVideoError = useCallback((cameraId: string) => {
    setVideoAvailable((prev) => ({ ...prev, [cameraId]: false }));
  }, []);

  const handleVideoLoadedData = useCallback((cameraId: string) => {
    setVideoAvailable((prev) => ({ ...prev, [cameraId]: true }));
  }, []);

  // Multi-Camera Scheduled Perception Loop
  useEffect(() => {
    if (!isEngineReady) return;

    const processMultiCameraLoop = async () => {
      const now = performance.now();

      for (const cam of ALL_CAMERA_CONFIGS) {
        const camId = cam.id;
        const isEnabled = analysisEnabled[camId] ?? false;
        const isAvail = videoAvailable[camId] ?? false;
        const video = videoRefs.current[camId];

        if (!isEnabled || !isAvail || !video || video.paused || video.readyState < 2) {
          continue;
        }

        const lastProc = lastProcessTimes.current[camId] ?? 0;
        if (now - lastProc < PERCEPTION_CONFIG.FRAME_INTERVAL_MS) {
          continue;
        }

        lastProcessTimes.current[camId] = now;

        // Process frame via single-queue perception engine
        const res = await globalVideoPerceptionEngine.processVideoFrame(video, cam.zoneId, cam.id);

        if (!res.skipped) {
          const fpsCalcTime = fpsLastCalcTimes.current[camId] ?? now;
          const currentCount = (fpsFrameCounters.current[camId] ?? 0) + 1;
          fpsFrameCounters.current[camId] = currentCount;

          let derivedFps = 0;
          if (now - fpsCalcTime >= 1000) {
            derivedFps = Math.round((currentCount * 1000) / (now - fpsCalcTime));
            fpsFrameCounters.current[camId] = 0;
            fpsLastCalcTimes.current[camId] = now;
          }

          // Update per-camera metrics
          setCameraMetrics((prev) => ({
            ...prev,
            [camId]: {
              tracks: res.tracks,
              detections: res.detections,
              processingTimeMs: res.processingTimeMs,
              fps: derivedFps || (prev[camId]?.fps ?? 3),
              confidence: res.rawTelemetry.confidencePercent ?? 92,
              lastFrameAt: Date.now(),
              totalFrames: (prev[camId]?.totalFrames ?? 0) + 1,
              isAvailable: true,
            },
          }));

          // Render preview canvas if this camera is currently selected in UI
          if (camId === selectedCamId && previewCanvasRef.current && video.videoWidth && video.videoHeight) {
            const canvas = previewCanvasRef.current;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth;
              if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight;

              ctx.clearRect(0, 0, canvas.width, canvas.height);
              res.tracks.forEach((track) => {
                const [x, y, w, h] = track.bbox;

                ctx.strokeStyle = "#10b981";
                ctx.lineWidth = 2.5;
                ctx.strokeRect(x, y, w, h);

                ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
                ctx.fillRect(x, y, w, h);

                const label = `${track.trackId} [${track.confidence}%]`;
                ctx.fillStyle = "#10b981";
                ctx.font = "bold 12px monospace";
                const textWidth = ctx.measureText(label).width;
                ctx.fillRect(x, Math.max(0, y - 20), textWidth + 8, 20);

                ctx.fillStyle = "#09090b";
                ctx.fillText(label, x + 4, Math.max(14, y - 5));

                ctx.fillStyle = "#3b82f6";
                ctx.beginPath();
                ctx.arc(track.center[0], track.center[1], 4, 0, 2 * Math.PI);
                ctx.fill();
              });
            }
          }

          // Propagate REAL_VIDEO telemetry to simulationStore & Graph Engines
          const store = useSimulationStore.getState();
          const targetZoneId = cam.zoneId;
          const currentPeopleCount = res.tracks.length * 1250 + 12000;
          const occupancy = Math.min(100, Math.round((currentPeopleCount / 50000) * 100));

          const computedState = computeZoneCrowdState(
            { zoneId: targetZoneId, name: targetZoneId, capacity: 50000 },
            {
              zoneId: targetZoneId,
              cameraId: cam.id,
              personCount: res.tracks.length,
              densityPerSqMeter: res.rawTelemetry.densityPerSqMeter,
              confidencePercent: res.rawTelemetry.confidencePercent,
              source: "CV",
              trackIds: res.tracks.map((t) => t.trackId),
              timestamp: Date.now(),
            },
            store.liveCrowdStates[targetZoneId]
          );

          store.updateZoneCrowdState(targetZoneId, {
            ...computedState,
            peopleCount: currentPeopleCount,
            occupancyPercent: occupancy,
            source: "CV",
            confidencePercent: res.rawTelemetry.confidencePercent,
            anonymousTrackIds: res.tracks.map((t) => t.trackId),
          });

          // Propagate real video perception directly to camera-mapped edges!
          store.updateCameraTelemetry(
            cam.id,
            res.tracks.length,
            res.rawTelemetry.confidencePercent ?? 92,
            res.tracks.map((t) => t.trackId),
            "REAL_VIDEO"
          );
        }
      }

      animFrameId.current = requestAnimationFrame(processMultiCameraLoop);
    };

    animFrameId.current = requestAnimationFrame(processMultiCameraLoop);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isEngineReady, analysisEnabled, videoAvailable, selectedCamId]);

  const toggleCameraAnalysis = (cameraId: string) => {
    setAnalysisEnabled((prev) => ({
      ...prev,
      [cameraId]: !prev[cameraId],
    }));
  };

  // Compute Overall Multi-Camera Perception Status (Part O)
  const activeAnalyzingCount = ALL_CAMERA_CONFIGS.filter(
    (c) => analysisEnabled[c.id] && videoAvailable[c.id]
  ).length;
  const totalDetections = Object.values(cameraMetrics).reduce(
    (sum, m) => sum + m.tracks.length,
    0
  );
  const avgConfidence =
    ALL_CAMERA_CONFIGS.filter((c) => analysisEnabled[c.id] && videoAvailable[c.id]).length > 0
      ? Math.round(
          ALL_CAMERA_CONFIGS.filter((c) => analysisEnabled[c.id] && videoAvailable[c.id]).reduce(
            (sum, c) => sum + (cameraMetrics[c.id]?.confidence ?? 90),
            0
          ) / activeAnalyzingCount
        )
      : 0;

  const selectedMetrics = cameraMetrics[selectedCamId] ?? {
    tracks: [],
    detections: [],
    processingTimeMs: 0,
    fps: 0,
    confidence: 0,
    lastFrameAt: null,
    totalFrames: 0,
    isAvailable: true,
  };

  return (
    <div className="rounded-xl border border-border bg-surface shadow-xl overflow-hidden space-y-4 p-5">
      {/* Background HTML5 Video Elements Decoding All Cameras Simultaneously */}
      <div className="hidden pointer-events-none" aria-hidden="true">
        {ALL_CAMERA_CONFIGS.map((cam) => (
          <video
            key={cam.id}
            ref={(el) => {
              videoRefs.current[cam.id] = el;
            }}
            src={cam.src}
            muted
            loop
            autoPlay
            playsInline
            onError={() => handleVideoError(cam.id)}
            onLoadedData={() => handleVideoLoadedData(cam.id)}
          />
        ))}
      </div>

      {/* Header & Overall Status Bar (Part O) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-emerald-400 animate-pulse" />
            <h3 className="text-sm font-bold text-foreground">
              Multi-Camera Perception Infrastructure
            </h3>
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] uppercase font-bold text-emerald-300 border border-emerald-500/40">
              REAL_VIDEO / TF.JS COCO-SSD
            </span>
          </div>
          <p className="text-xs text-foreground-muted mt-0.5">
            Concurrent background frame sampling · Centroid isolated tracking · Multi-edge crowd mapping
          </p>
        </div>

        {/* Compact Real-Time Perception Status Pill (Part O) */}
        <div className="flex items-center gap-3 bg-surface-muted/60 px-3.5 py-1.5 rounded-xl border border-border text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                activeAnalyzingCount > 0 ? "bg-emerald-500 animate-ping" : "bg-amber-500"
              }`}
            />
            <span className="font-bold text-foreground">
              ● {activeAnalyzingCount}/{ALL_CAMERA_CONFIGS.length} ANALYZING
            </span>
          </div>
          <span className="text-border">|</span>
          <span className="text-emerald-400 font-extrabold">{totalDetections} tracks active</span>
          <span className="text-border">|</span>
          <span className="text-blue-400 font-bold">{avgConfidence}% avg conf</span>
        </div>
      </div>

      {/* Active Camera View Selector Header (Part M) */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-surface-muted/40 p-2 rounded-lg border border-border">
        <div className="flex items-center gap-2">
          <Video className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-bold text-foreground">Preview Active Feed:</span>
          <span className="text-xs text-foreground-muted font-mono">
            (Background analysis continues on all active cameras)
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {ALL_CAMERA_CONFIGS.map((cam) => {
            const isAvail = videoAvailable[cam.id];
            const isAnal = analysisEnabled[cam.id];
            const isSelected = selectedCamId === cam.id;
            return (
              <button
                key={cam.id}
                onClick={() => setSelectedCamId(cam.id)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-accent text-accent-foreground shadow-md ring-1 ring-accent-foreground/20"
                    : "bg-surface-muted text-foreground-muted hover:text-foreground border border-border"
                }`}
              >
                <span>{cam.id.toUpperCase()}</span>
                {!isAvail ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" title="Offline" />
                ) : isAnal ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" title="Analyzing" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" title="Paused" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Selected Feed Canvas & Video Previewer */}
      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-border">
        {videoAvailable[selectedCamId] ? (
          <video
            src={selectedCamConfig.src}
            className="h-full w-full object-cover"
            muted
            loop
            autoPlay
            playsInline
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-zinc-950 text-foreground-muted">
            <ShieldAlert className="h-10 w-10 text-red-500/70 animate-pulse" />
            <span className="text-sm font-bold text-red-400">
              {selectedCamConfig.id.toUpperCase()} FEED OFFLINE
            </span>
            <span className="text-xs text-foreground-muted">
              Source file unavailable: {selectedCamConfig.src}
            </span>
            <span className="text-[10px] text-amber-400/80 font-mono mt-1">
              No live CV telemetry emitted for offline feeds
            </span>
          </div>
        )}

        <canvas
          ref={previewCanvasRef}
          className="absolute inset-0 h-full w-full pointer-events-none object-cover"
        />

        {/* Selected Feed Overlay Badge */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-border text-xs font-mono">
          <span
            className={`h-2 w-2 rounded-full ${
              analysisEnabled[selectedCamId] && videoAvailable[selectedCamId]
                ? "bg-emerald-500 animate-ping"
                : "bg-amber-500"
            }`}
          />
          <span className="text-foreground font-bold">
            {selectedCamConfig.name}
          </span>
          <span className="text-border">|</span>
          <span className="text-emerald-400 font-bold">
            {selectedMetrics.tracks.length} tracks
          </span>
          <span className="text-border">|</span>
          <span className="text-blue-400">{selectedMetrics.processingTimeMs} ms/frame</span>
        </div>

        {/* Single Camera Analysis Toggle Button */}
        <button
          type="button"
          onClick={() => toggleCameraAnalysis(selectedCamId)}
          disabled={!videoAvailable[selectedCamId]}
          className={`absolute bottom-3 right-3 flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold shadow-2xl transition-all ${
            analysisEnabled[selectedCamId]
              ? "bg-amber-500 text-black hover:bg-amber-400"
              : "bg-emerald-500 text-black hover:bg-emerald-400"
          } disabled:opacity-50`}
        >
          {analysisEnabled[selectedCamId] ? (
            <>
              <Pause className="h-4 w-4" /> Pause {selectedCamId.toUpperCase()} Inference
            </>
          ) : (
            <>
              <Play className="h-4 w-4" /> Start {selectedCamId.toUpperCase()} Inference
            </>
          )}
        </button>
      </div>

      {/* Multi-Camera Management Table (Part E & H) */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="px-4 py-2.5 border-b border-border bg-surface-muted/30 flex items-center justify-between">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
            Camera Perception Device Registry & Controls
          </h4>
          <span className="text-[10px] font-mono text-foreground-muted">
            Staggered Scheduler @ ~{PERCEPTION_CONFIG.PERCEPTION_FPS} FPS/cam
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-[10px] uppercase tracking-wide text-foreground-muted">
                <th className="px-3 py-2 font-medium">Camera</th>
                <th className="px-3 py-2 font-medium">Source Path</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Control</th>
                <th className="px-3 py-2 font-medium">People</th>
                <th className="px-3 py-2 font-medium">Confidence</th>
                <th className="px-3 py-2 font-medium">Mapped Edges</th>
              </tr>
            </thead>
            <tbody>
              {ALL_CAMERA_CONFIGS.map((cam) => {
                const isAvail = videoAvailable[cam.id];
                const isAnal = analysisEnabled[cam.id];
                const metrics = cameraMetrics[cam.id] ?? {
                  tracks: [],
                  detections: [],
                  processingTimeMs: 0,
                  fps: 0,
                  confidence: 0,
                  lastFrameAt: null,
                  totalFrames: 0,
                  isAvailable: true,
                };

                let statusBadge = (
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/40">
                    ANALYZING
                  </span>
                );
                if (!isAvail) {
                  statusBadge = (
                    <span className="rounded bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/40">
                      OFFLINE
                    </span>
                  );
                } else if (!isAnal) {
                  statusBadge = (
                    <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/40">
                      PAUSED
                    </span>
                  );
                }

                return (
                  <tr
                    key={cam.id}
                    className={`border-b border-border last:border-0 hover:bg-surface-muted/30 transition-colors ${
                      selectedCamId === cam.id ? "bg-accent/5" : ""
                    }`}
                  >
                    <td className="px-3 py-2.5">
                      <div className="font-bold text-foreground">{cam.name}</div>
                      <div className="text-[10px] font-mono text-foreground-muted">
                        {cam.id.toUpperCase()} · Zone: {cam.zoneId.toUpperCase()}
                      </div>
                    </td>

                    <td className="px-3 py-2.5 font-mono text-[10px] text-foreground-muted">
                      {cam.src}
                    </td>

                    <td className="px-3 py-2.5 font-mono">{statusBadge}</td>

                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => toggleCameraAnalysis(cam.id)}
                        disabled={!isAvail}
                        className={`rounded-md px-2.5 py-1 text-[10px] font-bold transition-all ${
                          isAnal && isAvail
                            ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40"
                            : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40"
                        } disabled:opacity-40`}
                      >
                        {isAnal && isAvail ? "Disable" : "Enable"}
                      </button>
                    </td>

                    <td className="px-3 py-2.5 font-bold font-mono text-foreground">
                      {isAvail && isAnal ? (
                        <span className="text-emerald-400">{metrics.tracks.length} tracks</span>
                      ) : (
                        <span className="text-foreground-muted">—</span>
                      )}
                    </td>

                    <td className="px-3 py-2.5 font-mono text-foreground-muted">
                      {isAvail && isAnal ? (
                        <span className="text-blue-400 font-bold">{metrics.confidence}%</span>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="px-3 py-2.5 font-mono text-[10px] text-foreground-muted">
                      <div className="flex flex-wrap gap-1">
                        {cam.mappedEdges.map((edgeId) => (
                          <span
                            key={edgeId}
                            className="rounded bg-surface-muted px-1.5 py-0.5 border border-border"
                          >
                            {edgeId}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Camera-Scoped Isolated Tracks Pills */}
      {selectedMetrics.tracks.length > 0 && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <Eye className="h-3.5 w-3.5" />
            <span>
              Active Isolated Tracks for {selectedCamConfig.id.toUpperCase()} (
              {selectedMetrics.tracks.length}):
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedMetrics.tracks.map((t) => (
              <span
                key={t.trackId}
                className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-300 border border-emerald-500/30"
              >
                {t.trackId} ({t.confidence}%)
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
