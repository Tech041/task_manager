import type { Task, TaskStatus } from "../types/task";
import TaskItem from "./TaskItem";

interface Props {
  tasks: Task[];
  updatingTaskId: number | null;
  onStatusChange: (id: number, status: TaskStatus) => void;
}

export default function TaskList({ tasks, updatingTaskId, onStatusChange }: Props) {
  if (tasks.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
        No tasks found.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          isUpdating={updatingTaskId === task.id}
          onStatusChange={onStatusChange}
        />
      ))}
    </ul>
  );
}