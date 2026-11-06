"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const task_route_1 = __importDefault(require("./src/module/task/task.route"));
const not_found_1 = require("./src/lib/common/middleware/not-found");
const error_handler_1 = require("./src/lib/common/middleware/error-handler");
const corsOptions = {
    origin: [
        "http://localhost:3000", // React client dev url
    ],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
const app = (0, express_1.default)();
app.use(express_1.default.json({ limit: "10mb" }));
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.get("/health", (_req, res) => {
    return res.status(200).json({ status: "ok" });
});
app.use("/api/tasks", task_route_1.default);
app.use(not_found_1.NotFound);
app.use(error_handler_1.errorHandler);
exports.default = app;
