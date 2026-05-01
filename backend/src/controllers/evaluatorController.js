import { evaluateResponse } from "../services/evaluatorService.js";
import { Report } from "../models/Report.js";

// Automated pre-evaluation of a RAG payload
export async function evaluateComplianceResponse(req, res) {
  const evaluation = evaluateResponse(req.validated);
  res.json({
    ok: true,
    evaluation,
  });
}

// Fetch all reports, optionally filtered by status
export async function getReports(req, res) {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const reports = await Report.find(filter).sort({ created_at: -1 });
    res.json({ ok: true, reports });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}

// Fetch a single report by report_id
export async function getReportById(req, res) {
  try {
    const report = await Report.findOne({ report_id: req.params.id });
    if (!report) return res.status(404).json({ ok: false, error: "Report not found" });
    res.json({ ok: true, report });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}

// Human evaluator submits a review
export async function submitReview(req, res) {
  try {
    const { status, remarks, evaluator_id } = req.body;
    
    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({ ok: false, error: "Invalid status. Must be 'verified' or 'rejected'." });
    }

    const report = await Report.findOneAndUpdate(
      { report_id: req.params.id },
      {
        status,
        evaluator_remarks: remarks,
        $set: { "evaluation_metadata.evaluator_id": evaluator_id, "evaluation_metadata.evaluated_at": new Date() },
      },
      { new: true }
    );

    if (!report) return res.status(404).json({ ok: false, error: "Report not found" });
    res.json({ ok: true, report });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}
