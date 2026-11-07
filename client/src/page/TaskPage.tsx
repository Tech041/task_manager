import { useMemo, useState } from "react";
import { useTasks, useUpdateTaskStatus } from "../hooks/useTask";
import { getErrorMessage } from "../services/api";
import ErrorMessage from "../components/ErrorMessage";
import Spinner from "../components/Spinner";
import TaskFilter, { type StatusFilter } from "../components/TaskFilter";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";

export default function TasksPage() {
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const { data: tasks = [], isPending, isError, error, refetch } = useTasks();
  const updateStatus = useUpdateTaskStatus();

  const counts = useMemo(() => {
    const result: Record<StatusFilter, number> = {
      ALL: tasks.length,
      PENDING: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
    };
    for (const task of tasks) result[task.status] += 1;
    return result;
  }, [tasks]);

  const visibleTasks = useMemo(
    () =>
      filter === "ALL" ? tasks : tasks.filter((task) => task.status === filter),
    [tasks, filter],
  );

  const updatingTaskId = updateStatus.isPending
    ? updateStatus.variables.id
    : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Task Manager
          </h1>
          <p className="text-sm text-slate-500">
            Create tasks and track their progress.
          </p>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-3">
        <section className="lg:col-span-1">
          <div className="lg:sticky lg:top-6">
            <TaskForm />
          </div>
        </section>

        <section className="space-y-4 lg:col-span-2">
          <TaskFilter value={filter} counts={counts} onChange={setFilter} />

          {updateStatus.isError && (
            <ErrorMessage message={getErrorMessage(updateStatus.error)} />
          )}

          {isPending && <Spinner label="Loading tasks..." />}

          {isError && (
            <ErrorMessage
              message={getErrorMessage(error)}
              onRetry={() => refetch()}
            />
          )}

          {!isPending && !isError && (
            <TaskList
              tasks={visibleTasks}
              updatingTaskId={updatingTaskId}
              onStatusChange={(id, status) =>
                updateStatus.mutate({ id, status })
              }
            />
          )}
        </section>
      </main>
    </div>
  );
}
