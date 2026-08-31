import fs from "node:fs";
import path from "node:path";
import { pythonRagDir } from "../config/paths.js";

export function resolveReportPdfPath(report) {
  const candidates = [
    report.signed_pdf_path,
    report.pdf_path,
    path.join(pythonRagDir, "data", "reports", `${report.report_id}.signed.pdf`),
    path.join(pythonRagDir, "data", "reports", `${report.report_id}.pdf`),
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}
