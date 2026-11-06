"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const task_controller_js_1 = require("./task.controller.js");
const taskRouter = (0, express_1.Router)();
taskRouter.get("/", task_controller_js_1.taskController.list);
taskRouter.post("/", task_controller_js_1.taskController.create);
taskRouter.patch("/:id/status", task_controller_js_1.taskController.updateStatus);
exports.default = taskRouter;
