"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundError = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode, details) {
        super(message);
        this.name = new.target.name;
        this.statusCode = statusCode;
        this.details = details;
    }
}
exports.AppError = AppError;
class NotFoundError extends AppError {
    constructor(message = "Resource not found") {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
