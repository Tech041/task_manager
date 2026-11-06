"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTaskStatusSchema = exports.createTaskSchema = exports.taskIdParamSchema = exports.TASK_STATUSES = void 0;
const zod_1 = require("zod");
exports.TASK_STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED"];
const statusSchema = zod_1.z.enum(exports.TASK_STATUSES);
exports.taskIdParamSchema = zod_1.z.object({
    id: zod_1.z.coerce.number().int().positive().max(2147483647),
});
exports.createTaskSchema = zod_1.z.object({
    title: zod_1.z
        .string()
        .trim()
        .min(1, "Title is required")
        .max(150, "Title must be 150 characters or fewer"),
    description: zod_1.z
        .string()
        .trim()
        .min(1, "Description is required")
        .max(1000, "Description must be 1000 characters or fewer"),
});
exports.updateTaskStatusSchema = zod_1.z.object({
    status: statusSchema,
});
