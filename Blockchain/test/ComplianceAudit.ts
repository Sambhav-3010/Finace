import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("ComplianceAudit", function () {
  async function deployComplianceAudit() {
    const complianceAudit = await ethers.deployContract("ComplianceAudit") as any;
    const [deployer, verifier] = await ethers.getSigners();

    return { complianceAudit, deployer, verifier };
  }

  function buildReportData(reportId = "RPT-001") {
    return {
      reportId,
      ipfsCid: "bafybeigdyrztzhyqwefakecid1234567890example",
      documentHash: ethers.id(`document:${reportId}`),
      orgHash: ethers.id("organization:acme"),
      riskLevel: "HIGH",
    };
  }

  async function expectRevert(
    txPromise: Promise<unknown>,
    expectedReason: string,
  ) {
    try {
      await txPromise;
      expect.fail(`Expected revert with reason: ${expectedReason}`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : JSON.stringify(error);

      expect(message).to.include(expectedReason);
    }
  }

  it("stores a new report and returns the saved fields", async function () {
    const { complianceAudit } = await deployComplianceAudit();

    const report = buildReportData();

    const tx = await complianceAudit.storeReport(
      report.reportId,
      report.ipfsCid,
      report.documentHash,
      report.orgHash,
      report.riskLevel,
    );
    await tx.wait();

    const storedReport = await complianceAudit.getReport(report.reportId);

    expect(storedReport[0]).to.equal(report.reportId);
    expect(storedReport[1]).to.equal(report.ipfsCid);
    expect(storedReport[2]).to.equal(report.documentHash);
    expect(storedReport[3]).to.equal(report.orgHash);
    expect(storedReport[4]).to.equal(report.riskLevel);
    expect(storedReport[5]).to.be.greaterThan(0n);
    expect(storedReport[6]).to.equal(false);
    expect(storedReport[7]).to.equal(ethers.ZeroAddress);
    expect(storedReport[8]).to.equal("");
  });

  it("reverts if storing a report with an existing reportId", async function () {
    const { complianceAudit } = await deployComplianceAudit();

    const report = buildReportData();

    const tx = await complianceAudit.storeReport(
      report.reportId,
      report.ipfsCid,
      report.documentHash,
      report.orgHash,
      report.riskLevel,
    );
    await tx.wait();

    await expectRevert(
      complianceAudit.storeReport(
        report.reportId,
        report.ipfsCid,
        report.documentHash,
        report.orgHash,
        report.riskLevel,
      ),
      "Report already exists",
    );
  });

  it("verifies an existing report and records verifier metadata", async function () {
    const { complianceAudit, verifier } = await deployComplianceAudit();

    const report = buildReportData();
    const remarks = "Checked and approved by regulator";

    const storeTx = await complianceAudit.storeReport(
      report.reportId,
      report.ipfsCid,
      report.documentHash,
      report.orgHash,
      report.riskLevel,
    );
    await storeTx.wait();

    const verifyTx = await complianceAudit
      .connect(verifier)
      .verifyReport(report.reportId, remarks);
    await verifyTx.wait();

    const storedReport = await complianceAudit.getReport(report.reportId);

    expect(storedReport[6]).to.equal(true);
    expect(storedReport[7]).to.equal(verifier.address);
    expect(storedReport[8]).to.equal(remarks);
  });

  it("reverts when verifying a missing report", async function () {
    const { complianceAudit } = await deployComplianceAudit();

    await expectRevert(
      complianceAudit.verifyReport("RPT-404", "Not found"),
      "Report not found",
    );
  });

  it("reverts when verifying an already verified report", async function () {
    const { complianceAudit, verifier } = await deployComplianceAudit();

    const report = buildReportData();

    const storeTx = await complianceAudit.storeReport(
      report.reportId,
      report.ipfsCid,
      report.documentHash,
      report.orgHash,
      report.riskLevel,
    );
    await storeTx.wait();

    const firstVerifyTx = await complianceAudit
      .connect(verifier)
      .verifyReport(report.reportId, "First verification");
    await firstVerifyTx.wait();

    await expectRevert(
      complianceAudit.verifyReport(report.reportId, "Second verification"),
      "Already verified",
    );
  });

  it("reverts when fetching a report that does not exist", async function () {
    const { complianceAudit } = await deployComplianceAudit();

    await expectRevert(
      complianceAudit.getReport("UNKNOWN-ID"),
      "Report not found",
    );
  });
});
