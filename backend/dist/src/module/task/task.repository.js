"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskRepository = void 0;
const prisma_1 = require("../../lib/prisma");
exports.taskRepository = {
    // GET endpoint
    findAll() {
        return prisma_1.prisma.task.findMany({ orderBy: { createdAt: "desc" } });
    },
    findById(id) {
        return prisma_1.prisma.task.findUnique({ where: { id } });
    },
    // POST endpoint
    create(data) {
        return prisma_1.prisma.task.create({ data });
    },
    //   PATCH  endpoint
    updateStatus(id, status) {
        return prisma_1.prisma.task.update({ where: { id }, data: { status } });
    },
};
