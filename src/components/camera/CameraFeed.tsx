"use client";

import { useCallback, useRef, useState } from "react";
import { Maximize2, Pause, Play, Video, Volume2, VolumeX } from "lucide-react";
import { getCameraMedia } from "@/data/media";
import type { CrowdTrend } from "@/lib/conditions";
import type { Camera } from "@/types";

const statusLabel: Record<Camera["status"], string> = {
  normal: "Normal",
  elevated: "Elevated",
  critical: "Critical",
};

const statusColor: Record<Camera["status"], string> = {
  normal: "text-risk-low",
  elevated: "text-risk-high",
  critical: "text-risk-critical",
};

const trendLabel: Record<CrowdTrend, string> = {
  increasing: "Increasing",
  stable: "Stable",
  decreasing: "Decreasing",
};

type CameraFeedProps = {
  camera: Camera;
  trend?: CrowdTrend;
  /** `tile` is a small grid cell; `primary` is the large selected feed. */
  size?: "tile" | "primary";
  /** Playback controls only make sense on the primary view. */
  controls?: boolean;
};

/**
 * The single place footage is rendered.
 *
 * Video comes from the media registry keyed by camera id — no page or card
 * ever names an asset path — and the component is written so the absence of
 * footage is a normal state, not an error: with no registered clip, or with a
 * clip that fails to load, it renders a labelled **Simulated camera feed**
 * panel and every analytic overlay still works. That matters because the
 * analytics, not the picture, are the product; the footage is the evidence
 * underneath them.
 */
export function CameraFeed({
  camera,
  trend = "stable",
  size = "tile",
  controls = false,
}: CameraFeedProps) {
  const media = getCameraMedia(camera.id);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // Keyed by source rather than a plain boolean, so registering a different
  // clip clears the failure without an effect: a file that 404s or won't
  // decode degrades to the placeholder instead of leaving a black rectangle.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);

  const showVideo = Boolean(media) && failedSrc !== media?.src;
  const isPrimary = size === "primary";

  /**
   * A native listener rather than React's `onError`: a media element's `error`
   * event doesn't bubble and can fire before React has wired its handler up,
   * which is exactly the case that matters — a registered file that 404s.
   * The ref also checks `el.error` on attach, catching a failure that already
   * happened, so a missing asset always lands on the placeholder.
   */
  const attachVideo = useCallback((element: HTMLVideoElement | null) => {
    videoRef.current = element;
    if (!element) return;

    const markFailed = () => setFailedSrc(element.getAttribute("src"));
    if (element.error) markFailed();
    element.addEventListener("error", markFailed);
    return () => element.removeEventListener("error", markFailed);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const goFullscreen = () => {
    void videoRef.current?.requestFullscreen?.();
  };

  return (
    <div
      // A fixed height rather than an aspect ratio: capping a 16:9 box's
      // height makes the browser narrow the box too, leaving the feed
      // floating in a half-empty panel.
      className={`relative overflow-hidden bg-black ${isPrimary ? "h-[360px]" : "h-32"}`}
    >
      {showVideo ? (
        <video
          ref={attachVideo}
          src={media?.src}
          poster={media?.poster}
          className="h-full w-full object-cover"
          muted={muted}
          loop
          autoPlay
          playsInline
        />
      ) : (
        /* Honest about being a prototype without looking like a broken feed:
           the analytics below are simulated, and this says so. */
        <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-white/45">
          <Video className={isPrimary ? "h-7 w-7" : "h-5 w-5"} />
          <span className="text-[11px]">Simulated camera feed</span>
        </div>
      )}

      {/* Identity, top-left — always readable over footage or placeholder. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 bg-gradient-to-b from-black/65 to-transparent px-2.5 py-2">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold tracking-wide text-white">
            {camera.name.split(" · ")[0]}
          </p>
          {isPrimary && (
            <p className="truncate text-[11px] text-white/70">{camera.coverageArea}</p>
          )}
        </div>
        <span className="shrink-0 rounded bg-black/45 px-1.5 py-0.5 text-[10px] tabular-nums text-white/80">
          {camera.observedAt}
        </span>
      </div>

      {/* Operational readings, bottom — one compact strip, footage still visible. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2.5 pb-2 pt-5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-[11px] text-white/85">
          <span className="tabular-nums">Flow {camera.flowPerMinute}/min</span>
          <span className="tabular-nums">{camera.peopleDetected.toLocaleString()} people</span>
          <span className="tabular-nums">{camera.densityPercent}% density</span>
          {isPrimary && <span>{trendLabel[trend]}</span>}
          <span className={`ml-auto font-semibold ${statusColor[camera.status]}`}>
            {statusLabel[camera.status]}
          </span>
        </div>
      </div>

      {controls && showVideo && (
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 flex-col gap-1.5">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? "Pause footage" : "Play footage"}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "Unmute footage" : "Mute footage"}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={goFullscreen}
            aria-label="View footage fullscreen"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

/** Provenance line shown under a feed — source, coverage and licensing. */
export function CameraProvenance({ camera }: { camera: Camera }) {
  const media = getCameraMedia(camera.id);
  return (
    <p className="text-[11px] text-foreground-muted">
      Site camera · {camera.coverageArea} ·{" "}
      {media?.attribution ?? "no footage registered — analytics are simulated demo data"}
    </p>
  );
}
