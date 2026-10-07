"use client";

import { useState } from "react";
import { useEventAuthoringStore } from "@/store/eventAuthoringStore";
import { FileCode, Download, Upload, X, Check, AlertCircle } from "lucide-react";

type GeoJSONImportExportModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function GeoJSONImportExportModal({ isOpen, onClose }: GeoJSONImportExportModalProps) {
  const { exportGeoJSON, importGeoJSON, eventName } = useEventAuthoringStore();
  const [jsonText, setJsonText] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    const geojson = exportGeoJSON();
    setJsonText(geojson);

    // Trigger file download
    const blob = new Blob([geojson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${eventName.toLowerCase().replace(/\s+/g, "_")}_plan.geojson`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setStatusMessage({ type: "success", text: "GeoJSON plan downloaded successfully!" });
  };

  const handleImport = () => {
    if (!jsonText || jsonText.trim() === "") {
      setStatusMessage({ type: "error", text: "Please paste a valid GeoJSON FeatureCollection string." });
      return;
    }

    const success = importGeoJSON(jsonText);
    if (success) {
      setStatusMessage({ type: "success", text: "GeoJSON event plan imported successfully!" });
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setStatusMessage({ type: "error", text: "Failed to parse GeoJSON. Ensure it is a valid FeatureCollection." });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonText(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-surface p-5 shadow-2xl space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <FileCode className="h-5 w-5 text-accent" />
            <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider">
              GEOJSON / PLAN IMPORT & EXPORT
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-foreground-muted hover:bg-surface-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-foreground-muted">
          Export your authored spatial event boundary, sectors, assets, and routes as standard GeoJSON, or import an existing GIS plan.
        </p>

        {statusMessage && (
          <div
            className={`rounded-xl border p-3 flex items-center gap-2 font-bold ${
              statusMessage.type === "success"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                : "border-red-500/40 bg-red-500/10 text-red-400"
            }`}
          >
            {statusMessage.type === "success" ? (
              <Check className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="font-bold text-foreground uppercase text-[11px]">GeoJSON Code Buffer</label>
            <label className="cursor-pointer text-accent hover:underline font-semibold flex items-center gap-1">
              <Upload className="h-3.5 w-3.5" /> Load File
              <input type="file" accept=".geojson,.json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder="Paste GeoJSON FeatureCollection string here..."
            className="h-48 w-full rounded-xl border border-border bg-surface-muted/60 p-3 font-mono text-[11px] text-foreground focus:border-accent focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-surface-muted px-4 py-2 font-bold text-foreground hover:bg-surface-muted/80"
          >
            <Download className="h-4 w-4 text-accent" /> [ EXPORT GEOJSON FILE ]
          </button>

          <button
            type="button"
            onClick={handleImport}
            className="flex items-center gap-1.5 rounded-xl bg-accent px-5 py-2 font-extrabold text-accent-foreground hover:bg-accent/90 shadow-md"
          >
            <Upload className="h-4 w-4" /> [ IMPORT PLAN TO MAP ]
          </button>
        </div>
      </div>
    </div>
  );
}
