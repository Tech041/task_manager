import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { taskService } from "../services/task.services"
import type { TaskStatus } from "../types/task";

const TASKS_KEY = ["tasks"] as const;

export function useTasks() {
  return useQuery({
    queryKey: TASKS_KEY,
    queryFn: taskService.getAll,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: taskService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: TaskStatus }) =>
      taskService.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
  });
}