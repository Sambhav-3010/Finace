import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();

  const complianceAudit = await ethers.deployContract("ComplianceAudit");
  await complianceAudit.waitForDeployment();

  const contractAddress = await complianceAudit.getAddress();
  const networkData = await ethers.provider.getNetwork();

  console.log("ComplianceAudit deployed successfully");
  console.log(`Network: ${networkData.name}`);
  console.log(`Address: ${contractAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
