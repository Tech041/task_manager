import type { Request, Response } from "express";
import { taskService } from "./task.service";
import {
  createTaskSchema,
  taskIdParamSchema,
  updateTaskStatusSchema,
} from "./task.validation";

export const taskController = {
  async list(_req: Request, res: Response) {
    const tasks = await taskService.getAllTasks();
    return res.status(200).json(tasks);
  },

  async create(req: Request, res: Response) {
    const input = createTaskSchema.parse(req.body);
    const task = await taskService.createTask(input);
    return res.status(201).json(task);
  },

  async updateStatus(req: Request, res: Response) {
    const { id } = taskIdParamSchema.parse(req.params);
    const { status } = updateTaskStatusSchema.parse(req.body);
    const task = await taskService.updateTaskStatus(id, status);
    return res.status(200).json(task);
  },
};
