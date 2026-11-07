import { STATUS_LABELS, type TaskStatus } from "../types/task";

const STYLES: Record<TaskStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
};

export default function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}