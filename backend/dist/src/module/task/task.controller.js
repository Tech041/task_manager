"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskController = void 0;
const task_service_1 = require("./task.service");
const task_validation_1 = require("./task.validation");
exports.taskController = {
    async list(_req, res) {
        const tasks = await task_service_1.taskService.getAllTasks();
        return res.status(200).json(tasks);
    },
    async create(req, res) {
        const input = task_validation_1.createTaskSchema.parse(req.body);
        const task = await task_service_1.taskService.createTask(input);
        return res.status(201).json(task);
    },
    async updateStatus(req, res) {
        const { id } = task_validation_1.taskIdParamSchema.parse(req.params);
        const { status } = task_validation_1.updateTaskStatusSchema.parse(req.body);
        const task = await task_service_1.taskService.updateTaskStatus(id, status);
        return res.status(200).json(task);
    },
};
