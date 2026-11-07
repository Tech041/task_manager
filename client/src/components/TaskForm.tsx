import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateTask } from "../hooks/useTask";
import { getErrorMessage } from "../services/api";
import ErrorMessage from "./ErrorMessage";

const TITLE_MAX = 150;

const taskFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(TITLE_MAX, `Title must be ${TITLE_MAX} characters or fewer.`),
  description: z.string().trim().min(1, "Description is required."),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

export default function TaskForm() {
  const createTask = useCreateTask();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: { title: "", description: "" },
  });

  // `values` is already validated and trimmed by the Zod schema
  const onSubmit = (values: TaskFormValues) => {
    createTask.mutate(
      { ...values, status: "PENDING" },
      {
        onSuccess: () => reset(),
      },
    );
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
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
          maxLength={TITLE_MAX}
          placeholder="e.g. Write unit tests"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          {...register("title")}
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
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
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          {...register("description")}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-600">
            {errors.description.message}
          </p>
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
