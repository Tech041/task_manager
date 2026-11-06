import type { RequestHandler } from "express";

export const NotFound: RequestHandler = (req, res) => {
  res
    .status(404)
    .json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
};
