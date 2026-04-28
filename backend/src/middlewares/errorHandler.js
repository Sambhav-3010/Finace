export function notFoundHandler(_req, res) {
  res.status(404).json({
    error: "not_found",
    message: "Route not found",
  });
}

export function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;
  const code = err.code || "internal_error";
  const message = err.message || "Unexpected server error";

  res.status(statusCode).json({
    error: code,
    message,
  });
}
