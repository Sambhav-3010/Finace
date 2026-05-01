import { env } from "../config/env.js";

export function notFoundHandler(req, res) {
  res.status(404).json({
    error: "not_found",
    message: "Route not found",
    requestId: req.requestId,
  });
}

export function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const code = err.code || "internal_error";
  const message = err.message || "Unexpected server error";

  if (statusCode >= 400) {
    console.error(`[${req.requestId}] ${req.method} ${req.url} - Error:`, err);
  }

  res.status(statusCode).json({
    error: code,
    message,
    requestId: req.requestId,
    details: err.details ?? undefined,
    stack: env.nodeEnv === "production" ? undefined : err.stack,
  });
}
