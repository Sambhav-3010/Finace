import { runGeneralQuery, runRegulationSearch } from "../services/ragService.js";

function toCompactResponse(result) {
  const analysis = result?.analysis ?? {};
  const clauses = Array.isArray(analysis.applicable_clauses) ? analysis.applicable_clauses : [];
  const citations = clauses.slice(0, 5).map((clause) => ({
    title: clause.title || "",
    source: clause.source || "",
    text: (clause.text || "").slice(0, 420),
  }));

  const answer =
    analysis.explanation ||
    (Array.isArray(analysis.recommendations) ? analysis.recommendations.join(" ") : "");

  return {
    answer,
    confidence:
      typeof analysis.compliance_score === "number"
        ? analysis.compliance_score / 100
        : 0.55,
    callType: analysis.call_type || "general_query",
    riskLevel: analysis.risk_level || "LOW",
    riskFlags: analysis.risk_flags || [],
    recommendations: analysis.recommendations || [],
    reasoningSteps: analysis.reasoning_steps || [],
    citations,
    raw: result,
  };
}

export async function askGeneralQuery(req, res) {
  const result = await runGeneralQuery(req.validated);
  res.json(toCompactResponse(result));
}

export async function searchRegulations(req, res) {
  const { q, regulator, topK } = req.query;
  
  if (!q || q.trim() === "") {
    return res.json({ ok: true, data: [] });
  }

  const result = await runRegulationSearch({
    query: q,
    regulator,
    topK: topK ? parseInt(topK, 10) : 10,
  });
  res.json({
    ok: true,
    data: result.results || [],
  });
}
