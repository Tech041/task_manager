import type { CreateTaskPayload, Task, TaskStatus } from "../types/task";
import apiRequest from "../utils/apiRequest";

export const taskService = {
  async getAll(): Promise<Task[]> {
    const { data } = await apiRequest.get<Task[]>("/tasks");
    return data;
  },

  async create(payload: CreateTaskPayload): Promise<Task> {
    const { data } = await apiRequest.post<Task>("/tasks", payload);
    return data;
  },

  async updateStatus(id: number, status: TaskStatus): Promise<Task> {
    const { data } = await apiRequest.patch<Task>(`/tasks/${id}/status`, {
      status,
    });
    return data;
  },
};
