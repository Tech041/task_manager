export const TASK_STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description: string;
}
