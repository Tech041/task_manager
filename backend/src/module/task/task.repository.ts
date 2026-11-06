import { prisma } from "../../lib/prisma";
import type { CreateTaskInput, TaskStatusValue } from "./task.validation";

export const taskRepository = {
  // GET endpoint
  findAll() {
    return prisma.task.findMany({ orderBy: { createdAt: "desc" } });
  },

  findById(id: number) {
    return prisma.task.findUnique({ where: { id } });
  },
  // POST endpoint
  create(data: CreateTaskInput) {
    return prisma.task.create({ data });
  },

  //   PATCH  endpoint
  updateStatus(id: number, status: TaskStatusValue) {
    return prisma.task.update({ where: { id }, data: { status } });
  },
};
