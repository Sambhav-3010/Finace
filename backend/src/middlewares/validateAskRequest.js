export function validateAskRequest(req, res, next) {
  const { prompt } = req.body ?? {};
  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    res.status(400).json({
      error: "validation_error",
      message: "prompt is required",
    });
    return;
  }
  next();
}
