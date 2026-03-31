import { expect } from "chai";
import { network } from "hardhat";

const { ethers, networkHelpers } = await network.connect();

describe("ComplianceAudit", function () {

  // Fixture to deploy the ComplianceAudit contract and set up test accounts
  async function deployComplianceAuditFixture() {
    const complianceAudit = await ethers.deployContract("ComplianceAudit");
    const [deployer, verifier] = await ethers.getSigners();
    return { complianceAudit, deployer, verifier };
  }

  // Helper function to generate a mock report data object
  function buildReportData(reportId = "RPT-001", orgName = "Acme Corp") {
    return {
      reportId,
      ipfsCid: "bafybeigdyrztzhyqwefakecid1234567890",
      documentHash: ethers.id(`document: ${reportId}`),
      orgName: ethers.id(`organization: ${orgName}`),
      riskLevel: "HIGH",
    };
  }

  // Test case to verify that a new report can be stored and retrieved correctly
  it("stores a new report and returns the saved fields", async function () {
    const { complianceAudit } = await networkHelpers.loadFixture(
      deployComplianceAuditFixture,
    );

    const report = buildReportData();

    await expect(
     complianceAudit.storeReport(
        report.reportId,
        report.ipfsCid,
        report.documentHash,
        report.orgName,
        report.riskLevel,
      ), 
    ).to.emit(complianceAudit, "ReportStored");

    const storedReport = await complianceAudit.getReport(report.reportId);

    expect(storedReport.reportId).to.equal(report.reportId);
    expect(storedReport.ipfsCid).to.equal(report.ipfsCid);
    expect(storedReport.documentHash).to.equal(report.documentHash);
    expect(storedReport.orgName).to.equal(report.orgName);
    expect(storedReport.riskLevel).to.equal(report.riskLevel);
    expect(storedReport.timestamp).to.be.greaterThan(0n);
    expect(storedReport.verified).to.equal(false);
    expect(storedReport.verifiedBy).to.equal(ethers.ZeroAddress);
    expect(storedReport.remarks).to.equal("");
  });

  // Test case to verify that storing a report with an existing reportId reverts
  it("reverts if storing a report with an existing reportId", async function () {
    const { complianceAudit } = await networkHelpers.loadFixture(
      deployComplianceAuditFixture,
    );

    const report = buildReportData();

    await complianceAudit.storeReport(
      report.reportId,
      report.ipfsCid,
      report.documentHash,
      report.orgName,
      report.riskLevel,
    );

    await expect(
      complianceAudit.storeReport(
        report.reportId,
        report.ipfsCid,
        report.documentHash,
        report.orgName,
        report.riskLevel,
      ),
    ).to.be.revertedWith("Report already exists");
  });

  // Test case to verify that an existing report can be verified and that verifier metadata is recorded
  it("verifies an existing report and records verifier metadata", async function () {
    const { complianceAudit, verifier } = await networkHelpers.loadFixture(
      deployComplianceAuditFixture,
    );

    const report = buildReportData();
    const remarks = "Checked and approved by regulator";

    await complianceAudit.storeReport(
      report.reportId,
      report.ipfsCid,
      report.documentHash,
      report.orgName,
      report.riskLevel,
    );

    await expect(
      complianceAudit.connect(verifier).verifyReport(report.reportId, remarks),
    ).to.emit(complianceAudit, "ReportVerified");

    const storedReport = await complianceAudit.getReport(report.reportId);

    expect(storedReport.verified).to.equal(true);
    expect(storedReport.verifiedBy).to.equal(verifier.address);
    expect(storedReport.remarks).to.equal(remarks);
  });

  // Test case to verify that verifying a non-existent report reverts with the correct error message
  it("reverts when verifying a missing report", async function () {
    const { complianceAudit } = await networkHelpers.loadFixture(
      deployComplianceAuditFixture,
    );

    await expect(
      complianceAudit.verifyReport("RPT-404", "Not found"),
    ).to.be.revertedWith("Report not found");
  });

  // Test case to verify that verifying an already verified report reverts with the correct error message
  it("reverts when verifying an already verified report", async function () {
    const { complianceAudit, verifier } = await networkHelpers.loadFixture(
      deployComplianceAuditFixture,
    );

    const report = buildReportData();

    await complianceAudit.storeReport(
      report.reportId,
      report.ipfsCid,
      report.documentHash,
      report.orgName,
      report.riskLevel,
    );

    await complianceAudit.connect(verifier).verifyReport(report.reportId, "First verification");

    await expect(
      complianceAudit.verifyReport(report.reportId, "Second verification"),
    ).to.be.revertedWith("Already verified");
  });

  // Test case to verify that fetching a non-existent report reverts with the correct error message
  it("reverts when fetching a report that does not exist", async function () {
    const { complianceAudit } = await networkHelpers.loadFixture(
      deployComplianceAuditFixture,
    );

    await expect(complianceAudit.getReport("UNKNOWN-ID")).to.be.revertedWith(
      "Report not found",
    );
  });
});
