"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskService = void 0;
const app_error_1 = require("../../lib/common/errors/app-error");
const task_repository_1 = require("./task.repository");
exports.taskService = {
    getAllTasks() {
        return task_repository_1.taskRepository.findAll();
    },
    createTask(input) {
        return task_repository_1.taskRepository.create(input);
    },
    async updateTaskStatus(id, status) {
        const existing = await task_repository_1.taskRepository.findById(id);
        if (!existing) {
            throw new app_error_1.NotFoundError("Task not found");
        }
        return task_repository_1.taskRepository.updateStatus(id, status);
    },
};
