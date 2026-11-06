import { NotFoundError } from "../../lib/common/errors/app-error";
import { taskRepository } from "./task.repository";
import type { CreateTaskInput, TaskStatusValue } from "./task.validation";

export const taskService = {
  getAllTasks() {
    return taskRepository.findAll();
  },

  createTask(input: CreateTaskInput) {
    return taskRepository.create(input);
  },

  async updateTaskStatus(id: number, status: TaskStatusValue) {
    const existing = await taskRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Task not found");
    }
    return taskRepository.updateStatus(id, status);
  },
};
