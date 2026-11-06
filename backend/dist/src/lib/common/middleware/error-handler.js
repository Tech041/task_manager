"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const app_error_js_1 = require("../errors/app-error.js");
const errorHandler = (err, _req, res, _next) => {
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            error: "Validation failed",
            details: err.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            })),
        });
    }
    if (err instanceof app_error_js_1.AppError) {
        return res.status(err.statusCode).json({
            error: err.message,
            ...(err.details ? { details: err.details } : {}),
        });
    }
    // Malformed JSON thrown by express.json()
    if (err?.type === "entity.parse.failed") {
        return res.status(400).json({ error: "Invalid JSON body" });
    }
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
};
exports.errorHandler = errorHandler;
