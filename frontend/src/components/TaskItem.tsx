import {
  STATUS_LABELS,
  TASK_STATUSES,
  type Task,
  type TaskStatus,
} from "../types/task";
import StatusBadge from "./StatusBadge";

interface Props {
  task: Task;
  isUpdating: boolean;
  onStatusChange: (id: number, status: TaskStatus) => void;
}

export default function TaskItem({ task, isUpdating, onStatusChange }: Props) {
  const createdOn = new Date(task.createdAt).toLocaleDateString(undefined, {
    dateStyle: "medium",
  });

  return (
    <li className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="wrap-break-words font-medium text-slate-900">
            {task.title}
          </h3>
          <StatusBadge status={task.status} />
        </div>
        {task.description && (
          <p className="wrap-break-words text-sm text-slate-600">
            {task.description}
          </p>
        )}
        <p className="text-xs text-slate-400">Created {createdOn}</p>
      </div>

      <select
        aria-label={`Change status of ${task.title}`}
        value={task.status}
        disabled={isUpdating}
        onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
        className="w-full shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-60 sm:w-40"
      >
        {TASK_STATUSES.map((status) => (
          <option key={status} value={status}>
            {STATUS_LABELS[status]}
          </option>
        ))}
      </select>
    </li>
  );
}
