import { runGeneralQuery, runRegulationSearch } from "../services/ragService.js";

/**
 * Maps the complex RAG result into a clean format for the frontend chat.
 * Ensures the 'sources' field is present and contains full document references.
 */
function toChatResponse(result) {
  const analysis = result?.analysis ?? {};
  
  // Combine LLM-identified clauses and raw retrieval hits for maximum transparency
  const rawHits = Array.isArray(result.retrieval_hits) ? result.retrieval_hits : [];
  const identifiedClauses = Array.isArray(analysis.applicable_clauses) ? analysis.applicable_clauses : [];
  
  const sources = rawHits.map(hit => ({
    document_id: hit.document_id || hit.source || "Regulation",
    section: hit.section || hit.title || "General",
    text: hit.text || hit.content || ""
  }));

  // Ensure explanation is detailed
  const answer = analysis.explanation || "No detailed explanation provided by AI.";

  return {
    ok: true,
    answer,
    sources, // Frontend expects 'sources'
    riskLevel: analysis.risk_level || "LOW",
    riskFlags: analysis.risk_flags || [],
    recommendations: analysis.recommendations || [],
    complianceScore: analysis.compliance_score || 0,
    reasoningSteps: analysis.reasoning_steps || [],
    raw: analysis
  };
}

export async function askGeneralQuery(req, res) {
  try {
    const result = await runGeneralQuery(req.validated);
    res.json(toChatResponse(result));
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}

export async function searchRegulations(req, res) {
  const { q, regulator, topK } = req.query;
  
  if (!q || q.trim() === "") {
    return res.json({ ok: true, data: [] });
  }

  try {
    const result = await runRegulationSearch({
      query: q,
      regulator,
      topK: topK ? parseInt(topK, 10) : 10,
    });
    res.json({
      ok: true,
      data: result.results || [],
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}
