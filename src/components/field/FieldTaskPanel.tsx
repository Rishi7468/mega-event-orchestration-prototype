"use client";

import { useSimulationStore } from "@/store/simulationStore";
import type { TaskPriority, TaskStatus } from "@/types/fieldTask";

export function FieldTaskPanel() {
  const fieldTasks = useSimulationStore((state) => state.fieldTasks);
  const updateTaskStatus = useSimulationStore((state) => state.updateFieldTaskStatus);

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case "critical":
        return "bg-status-critical/15 text-status-critical border-status-critical/30";
      case "high":
        return "bg-amber-500/15 text-amber-500 border-amber-500/30";
      case "medium":
        return "bg-blue-500/15 text-blue-500 border-blue-500/30";
      default:
        return "bg-emerald-500/15 text-emerald-500 border-emerald-500/30";
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "in_progress":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      default:
        return "bg-slate-500/15 text-slate-400 border-slate-500/30";
    }
  };

  return (
    <div className="rounded-xl border border-surface-border bg-surface-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Active Field Tasks</h2>
          <p className="text-xs text-foreground-muted">Dispatched assignments for sector officers</p>
        </div>
        <span className="rounded-full bg-accent-glow/20 px-2.5 py-0.5 text-xs font-medium text-accent-glow">
          {fieldTasks.filter((t) => t.status !== "completed").length} Active
        </span>
      </div>

      <div className="space-y-3">
        {fieldTasks.map((task) => (
          <div
            key={task.id}
            className="rounded-lg border border-surface-border/60 bg-surface/50 p-4 space-y-3 transition-colors hover:border-surface-border"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{task.title}</span>
                  <span className={`rounded-md border px-2 py-0.5 text-[10px] uppercase font-semibold ${getPriorityBadge(task.priority)}`}>
                    {task.priority}
                  </span>
                  <span className={`rounded-md border px-2 py-0.5 text-[10px] uppercase font-semibold ${getStatusBadge(task.status)}`}>
                    {task.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-xs text-foreground-muted mt-1">{task.instruction}</p>
              </div>
              <span className="text-[10px] text-foreground-muted whitespace-nowrap">{task.createdAt}</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-surface-border/40 text-xs">
              <span className="text-foreground-muted">Assigned: <strong className="text-foreground font-normal">{task.assignedStaff}</strong></span>
              <div className="flex gap-2">
                {task.status === "assigned" && (
                  <button
                    onClick={() => updateTaskStatus(task.id, "in_progress")}
                    className="rounded-md bg-accent-glow/20 text-accent-glow hover:bg-accent-glow/30 px-3 py-1 font-medium transition-colors"
                  >
                    Accept Task
                  </button>
                )}
                {task.status === "in_progress" && (
                  <button
                    onClick={() => updateTaskStatus(task.id, "completed")}
                    className="rounded-md bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 px-3 py-1 font-medium transition-colors"
                  >
                    Mark Completed
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
