import { Router } from "express";
import { taskController } from "./task.controller.js";

const taskRouter = Router();

taskRouter.get("/", taskController.list);
taskRouter.post("/", taskController.create);
taskRouter.patch("/:id/status", taskController.updateStatus);

export default taskRouter;
