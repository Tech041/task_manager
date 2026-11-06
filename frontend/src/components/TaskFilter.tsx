import { STATUS_LABELS, TASK_STATUSES, type TaskStatus } from "../types/task";

export type StatusFilter = TaskStatus | "ALL";

interface Props {
  value: StatusFilter;
  counts: Record<StatusFilter, number>;
  onChange: (value: StatusFilter) => void;
}

const OPTIONS: StatusFilter[] = ["ALL", ...TASK_STATUSES];

export default function TaskFilter({ value, counts, onChange }: Props) {
  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Filter tasks by status">
      {OPTIONS.map((option) => {
        const active = option === value;
        return (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
              active
                ? "bg-indigo-600 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {option === "ALL" ? "All" : STATUS_LABELS[option]} ({counts[option]})
          </button>
        );
      })}
    </div>
  );
}