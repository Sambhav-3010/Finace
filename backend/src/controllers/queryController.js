import { runGeneralQuery } from "../services/ragService.js";

function toCompactResponse(result) {
  const analysis = result?.analysis ?? {};
  const clauses = Array.isArray(analysis.applicable_clauses) ? analysis.applicable_clauses : [];
  const citations = clauses.slice(0, 5).map((c) => ({
    title: c.title || "",
    source: c.source || "",
    text: (c.text || "").slice(0, 420),
  }));

  const answer =
    analysis.explanation ||
    (Array.isArray(analysis.recommendations) ? analysis.recommendations.join(" ") : "");

  return {
    answer,
    confidence: typeof analysis.compliance_score === "number" ? analysis.compliance_score / 100 : 0.55,
    call_type: analysis.call_type || "general_query",
    risk_level: analysis.risk_level || "LOW",
    risk_flags: analysis.risk_flags || [],
    recommendations: analysis.recommendations || [],
    reasoning_steps: analysis.reasoning_steps || [],
    citations,
    raw: result,
  };
}

export async function askGeneralQuery(req, res, next) {
  try {
    const { prompt, topK, regulator, category } = req.body;

    const result = await runGeneralQuery({
      prompt: prompt.trim(),
      topK: Number.isFinite(topK) ? Math.max(1, Math.min(20, topK)) : 5,
      regulator: regulator ?? null,
      category: category ?? null,
    });

    res.json(toCompactResponse(result));
  } catch (err) {
    err.statusCode = 500;
    err.code = "general_query_failed";
    next(err);
  }
}
