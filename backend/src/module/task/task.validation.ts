import { z } from "zod";

export const TASK_STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED"] as const;

const statusSchema = z.enum(TASK_STATUSES);

export const taskIdParamSchema = z.object({
  id: z.coerce.number().int().positive().max(2_147_483_647),
});

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(150, "Title must be 150 characters or fewer"),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(1000, "Description must be 1000 characters or fewer"),
  status: statusSchema,
});

export const updateTaskStatusSchema = z.object({
  status: statusSchema,
});

export type TaskStatusValue = z.infer<typeof statusSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
