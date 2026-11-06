"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFound = void 0;
const NotFound = (req, res) => {
    res
        .status(404)
        .json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
};
exports.NotFound = NotFound;
