import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireApiKey } from "../middlewares/requireApiKey.js";
import { runGeneralQuery } from "../services/ragService.js";
import { storeComplianceProof, getBlockchainDeployment } from "../services/blockchainService.js";
import { postJson } from "../services/httpClient.js";
import { Report } from "../models/Report.js";
import { env } from "../config/env.js";
import crypto from "crypto";

const router = Router();

// ────────────────────────────────────────────
// POST /reports/generate  — New compliance report (call_type: new_report)
// ────────────────────────────────────────────
router.post(
  "/generate",
  requireApiKey,
  asyncHandler(async (req, res) => {
    const { workflow_text, regulator, user_id } = req.body;
    
    if (!workflow_text) {
      return res.status(400).json({ ok: false, error: "workflow_text is required" });
    }

    // Call the Python RAG service
    const result = await runGeneralQuery({ 
      prompt: workflow_text, 
      regulator: regulator || "RBI" 
    });

    const analysis = result?.analysis || {};
    const report_id = `rep-${crypto.randomBytes(4).toString("hex")}`;

    const compliance_score = typeof analysis.compliance_score === "number" 
      ? analysis.compliance_score 
      : 55;

    // Persist report in MongoDB
    const report = await Report.create({
      report_id,
      user_id: user_id || "system",
      workflow_input: { text: workflow_text, regulator },
      risk_level: analysis.risk_level || "MEDIUM",
      risk_flags: analysis.risk_flags || [],
      applicable_clauses: Array.isArray(analysis.applicable_clauses) ? analysis.applicable_clauses : [],
      explanation: analysis.explanation || "Automated analysis completed.",
      recommendations: analysis.recommendations || [],
      compliance_score,
      status: "pending",
    });

    res.json({ ok: true, report_id: report.report_id, report });
  })
);

// ────────────────────────────────────────────
// POST /reports/update  — Update existing report (call_type: update_report)
// Compares existing context against latest/superseded regulations.
// ────────────────────────────────────────────
router.post(
  "/update",
  requireApiKey,
  asyncHandler(async (req, res) => {
    const { report_id, workflow_text, regulator } = req.body;

    if (!report_id) {
      return res.status(400).json({ ok: false, error: "report_id is required" });
    }

    const existing = await Report.findOne({ report_id });
    if (!existing) {
      return res.status(404).json({ ok: false, error: "Report not found" });
    }

    // Build context from the existing report for the update_report call
    const existingReportText = [
      `Risk Level: ${existing.risk_level}`,
      `Explanation: ${existing.explanation || ""}`,
      `Recommendations: ${(existing.recommendations || []).join("; ")}`,
      `Compliance Score: ${existing.compliance_score}`,
    ].join("\n");

    const queryWorkflow = workflow_text || existing.workflow_input?.text || "";

    // Call RAG with update_report call_type via FastAPI
    const result = await postJson(
      `${env.fastApiBaseUrl}/analyze`,
      {
        call_type: "update_report",
        workflow_text: queryWorkflow,
        existing_report_text: existingReportText,
        regulator: regulator || existing.workflow_input?.regulator || "RBI",
        top_k: 5,
      },
      { timeoutMs: env.fastApiTimeoutMs }
    );

    const analysis = result?.analysis || {};

    // Update the report in MongoDB
    const updated = await Report.findOneAndUpdate(
      { report_id },
      {
        risk_level: analysis.risk_level || existing.risk_level,
        risk_flags: analysis.risk_flags || existing.risk_flags,
        applicable_clauses: analysis.applicable_clauses || existing.applicable_clauses,
        explanation: analysis.explanation || existing.explanation,
        recommendations: analysis.recommendations || existing.recommendations,
        compliance_score: typeof analysis.compliance_score === "number"
          ? analysis.compliance_score
          : existing.compliance_score,
        status: "pending", // Reset to pending after update
        $push: {
          "evaluation_metadata.update_history": {
            updated_at: new Date(),
            superseded_references: analysis.superseded_references || [],
            change_notes: analysis.superseded_change_notes || [],
          },
        },
      },
      { new: true }
    );

    res.json({ ok: true, report_id, report: updated, raw_analysis: analysis });
  })
);

// ────────────────────────────────────────────
// POST /reports/proof  — Upload to IPFS + store proof on blockchain
// Triggers the full finalization pipeline: IPFS → Blockchain → MongoDB update
// ────────────────────────────────────────────
router.post(
  "/proof",
  requireApiKey,
  asyncHandler(async (req, res) => {
    const { report_id, org_name } = req.body;

    if (!report_id) {
      return res.status(400).json({ ok: false, error: "report_id is required" });
    }
    if (!org_name) {
      return res.status(400).json({ ok: false, error: "org_name is required" });
    }

    const report = await Report.findOne({ report_id });
    if (!report) {
      return res.status(404).json({ ok: false, error: "Report not found" });
    }

    // Step 1: Generate PDF report via FastAPI
    let pdfPath = report.pdf_path;
    if (!pdfPath) {
      try {
        const pdfResult = await postJson(
          `${env.fastApiBaseUrl}/report`,
          {
            report_id,
            org_name,
            analysis: {
              risk_level: report.risk_level,
              compliance_score: report.compliance_score,
              explanation: report.explanation,
              recommendations: report.recommendations,
              applicable_clauses: report.applicable_clauses,
              risk_flags: report.risk_flags,
            },
          },
          { timeoutMs: 60000 }
        );
        pdfPath = pdfResult?.pdf_path || null;
      } catch (err) {
        // PDF generation is optional; continue without it
        pdfPath = null;
      }
    }

    // Step 2: Upload to IPFS via FastAPI
    let ipfsCid = report.ipfs_cid;
    if (!ipfsCid && pdfPath) {
      try {
        const ipfsResult = await postJson(
          `${env.fastApiBaseUrl}/ipfs`,
          { file_path: pdfPath },
          { timeoutMs: 120000 }
        );
        ipfsCid = ipfsResult?.ipfs_cid || null;
      } catch (err) {
        return res.status(502).json({
          ok: false,
          error: "IPFS upload failed",
          detail: err.message,
        });
      }
    }

    if (!ipfsCid) {
      return res.status(422).json({
        ok: false,
        error: "Cannot create proof without IPFS CID. Generate a PDF report first.",
      });
    }

    // Step 3: Store proof on blockchain
    const deployment = getBlockchainDeployment();
    const documentHash = `0x${crypto.createHash("sha256").update(JSON.stringify(report.toObject())).digest("hex")}`;

    const blockchainResult = await storeComplianceProof({
      reportId: report_id,
      ipfsCid,
      documentHash,
      orgName: org_name,
      riskLevel: report.risk_level || "MEDIUM",
      contractAddress: deployment.address,
    });

    // Step 4: Update MongoDB with IPFS CID and tx hash
    const txHash = blockchainResult.transactionHash || null;
    const updated = await Report.findOneAndUpdate(
      { report_id },
      {
        ipfs_cid: ipfsCid,
        tx_hash: txHash,
        pdf_path: pdfPath,
      },
      { new: true }
    );

    res.status(201).json({
      ok: true,
      report_id,
      ipfs_cid: ipfsCid,
      tx_hash: txHash,
      block_number: blockchainResult.blockNumber,
      network: blockchainResult.network,
      report: updated,
    });
  })
);

export default router;
