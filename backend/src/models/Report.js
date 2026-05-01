import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    report_id: {
      type: String,
      required: true,
      unique: true,
    },
    user_id: {
      type: String,
      required: false,
    },
    workflow_input: {
      type: Object,
      default: {},
    },
    risk_level: {
      type: String,
      enum: ["HIGH", "MEDIUM", "LOW"],
    },
    risk_flags: [String],
    applicable_clauses: [Object],
    explanation: String,
    recommendations: [String],
    compliance_score: {
      type: Number,
      min: 0,
      max: 100,
    },
    pdf_path: String,
    ipfs_cid: String,
    tx_hash: String,
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    evaluator_remarks: String,
    evaluation_metadata: {
      type: Object,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "reports",
  }
);

export const Report = mongoose.model("Report", reportSchema);
