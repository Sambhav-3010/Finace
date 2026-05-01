import { evaluateResponse } from "../services/evaluatorService.js";
import { Report } from "../models/Report.js";

// Automated pre-evaluation
export async function evaluateComplianceResponse(req, res) {
  const evaluation = evaluateResponse(req.validated);
  res.json({ ok: true, evaluation });
}

/**
 * getReports - Role-based visibility
 * Companies (user) see ONLY their own reports.
 * Evaluators see ALL reports from all companies.
 */
export async function getReports(req, res) {
  try {
    const { status } = req.query;
    let filter = {};

    // Apply status filter if provided
    if (status) filter.status = status;

    // Apply ownership filter
    // req.user is set by the requireAuth middleware
    if (req.user.role === "user") {
      filter.user_id = req.user.user_id;
    } 
    // If role is 'evaluator', we don't add the user_id filter (they see everything)

    const reports = await Report.find(filter).sort({ created_at: -1 });
    res.json({ ok: true, reports });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}

export async function getReportById(req, res) {
  try {
    const filter = { report_id: req.params.id };
    
    // Safety: Companies can only fetch their own report
    if (req.user.role === "user") {
      filter.user_id = req.user.user_id;
    }

    const report = await Report.findOne(filter);
    if (!report) return res.status(404).json({ ok: false, error: "Report not found or access denied" });
    res.json({ ok: true, report });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}

export async function submitReview(req, res) {
  try {
    const { status, evaluator_remarks, remarks } = req.body;
    const finalRemarks = evaluator_remarks || remarks || "";
    const evaluator_id = req.user?.evaluator_id || req.user?.user_id || "unknown";

    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({ ok: false, error: "Invalid status" });
    }

    const report = await Report.findOneAndUpdate(
      { report_id: req.params.id },
      {
        status,
        evaluator_remarks: finalRemarks,
        $set: {
          "evaluation_metadata.evaluator_id": evaluator_id,
          "evaluation_metadata.evaluator_name": req.user?.name || "Legal Expert",
          "evaluation_metadata.evaluated_at": new Date(),
        },
      },
      { new: true }
    );

    if (!report) return res.status(404).json({ ok: false, error: "Report not found" });
    res.json({ ok: true, report });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}
