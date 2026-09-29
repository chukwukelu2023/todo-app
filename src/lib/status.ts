export const TASK_STATUSES = ["BACKLOG", "PENDING", "IN_PROGRESS", "COMPLETED"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  BACKLOG: "Backlog",
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};

export const STATUS_STYLES: Record<TaskStatus, string> = {
  BACKLOG: "bg-slate-100 text-slate-700 ring-slate-300",
  PENDING: "bg-amber-50 text-amber-800 ring-amber-300",
  IN_PROGRESS: "bg-blue-50 text-blue-800 ring-blue-300",
  COMPLETED: "bg-emerald-50 text-emerald-800 ring-emerald-300",
};

export function isTaskStatus(value: unknown): value is TaskStatus {
  return typeof value === "string" && (TASK_STATUSES as readonly string[]).includes(value);
}

export const ROLES = ["ADMIN", "USER"] as const;
export type Role = (typeof ROLES)[number];
