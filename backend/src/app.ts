import express, { Application, NextFunction, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import taskRouter from "./module/task/task.route";
import { NotFound } from "./lib/common/middleware/not-found";
import { errorHandler } from "./lib/common/middleware/error-handler";

const corsOptions = {
  origin: [
    "http://localhost:3000", // React client dev url
  ],
  credentials: true,
  methods: ["GET", "POST", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

const app: Application = express();
app.use(express.json({ limit: "10mb" }));
app.use(helmet());
app.use(cors(corsOptions));

app.use(express.json());

app.get("/health", (_req, res) => {
  return res.status(200).json({ status: "ok" });
});

app.use("/api/tasks", taskRouter);

app.use(NotFound);
app.use(errorHandler);

export default app;
