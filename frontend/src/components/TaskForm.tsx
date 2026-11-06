import { useState, type FormEvent } from "react";
import { useCreateTask } from "../hooks/useTask";
import { getErrorMessage } from "../services/api";
import ErrorMessage from "./ErrorMessage";

const TITLE_MAX = 150;

export default function TaskForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const createTask = useCreateTask();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    if (!trimmedTitle) {
      setTitleError("Title is required.");
      return;
    }
    if (!trimmedDescription) {
      setDescriptionError("Description is required.");
      return;
    }
    setTitleError(null);
    setDescriptionError(null);

    createTask.mutate(
      { title: trimmedTitle, description: trimmedDescription },
      {
        onSuccess: () => {
          setTitle("");
          setDescription("");
        },
      },
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
    >
      <h2 className="text-lg font-semibold text-slate-900">New task</h2>

      <div>
        <label
          htmlFor="title"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          maxLength={TITLE_MAX}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Write unit tests"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        {titleError && (
          <p className="mt-1 text-xs text-red-600">{titleError}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Description <span className="font-normal text-slate-400"></span>
        </label>
        <textarea
          id="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        {descriptionError && (
          <p className="mt-1 text-xs text-red-600">{descriptionError}</p>
        )}
      </div>

      {createTask.isError && (
        <ErrorMessage message={getErrorMessage(createTask.error)} />
      )}

      <button
        type="submit"
        disabled={createTask.isPending}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {createTask.isPending ? "Creating..." : "Create task"}
      </button>
    </form>
  );
}
