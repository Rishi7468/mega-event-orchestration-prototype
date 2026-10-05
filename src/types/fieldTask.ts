export type TaskPriority = "low" | "medium" | "high" | "critical";
export type TaskStatus = "assigned" | "in_progress" | "completed";
export type FieldTaskType = "gate_control" | "crowd_direction" | "medical_assist" | "barrier_deploy";

export type FieldTask = {
  id: string;
  title: string;
  assignedStaff: string;
  zoneId: string;
  gateId?: string;
  type: FieldTaskType;
  priority: TaskPriority;
  status: TaskStatus;
  instruction: string;
  createdAt: string;
};
