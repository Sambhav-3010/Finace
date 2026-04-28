import { runGeneralQuery } from "../services/ragService.js";

export async function askGeneralQuery(req, res, next) {
  try {
    const { prompt, topK, regulator, category } = req.body;

    const result = await runGeneralQuery({
      prompt: prompt.trim(),
      topK: Number.isFinite(topK) ? Math.max(1, Math.min(20, topK)) : 5,
      regulator: regulator ?? null,
      category: category ?? null,
    });

    res.json(result);
  } catch (err) {
    err.statusCode = 500;
    err.code = "general_query_failed";
    next(err);
  }
}
