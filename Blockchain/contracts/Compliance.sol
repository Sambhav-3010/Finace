// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ComplianceAudit {

    struct Report {
        string reportId;
        string ipfsCid;
        bytes32 documentHash;
        bytes32 orgName;
        string riskLevel;
        uint256 timestamp;
        bool exists;
        bool verified;
        address verifiedBy;
        string remarks;
    }

    mapping(string => Report) private reports;

    event ReportStored(
        string reportId,
        string ipfsCid,
        bytes32 documentHash,
        bytes32 orgName,
        string riskLevel,
        uint256 timestamp
    );

    event ReportVerified(
        string reportId,
        address verifiedBy,
        string remarks,
        uint256 timestamp
    );

    // Stores a new compliance report with IPFS reference and metadata on-chain
    function storeReport(
        string memory _reportId,
        string memory _ipfsCid,
        bytes32 _documentHash,
        bytes32 _orgName,
        string memory _riskLevel
    ) public {

        require(!reports[_reportId].exists, "Report already exists");

        reports[_reportId] = Report({
            reportId: _reportId,
            ipfsCid: _ipfsCid,
            documentHash: _documentHash,
            orgName: _orgName,
            riskLevel: _riskLevel,
            timestamp: block.timestamp,
            exists: true,
            verified: false,
            verifiedBy: address(0),
            remarks: ""
        });

        emit ReportStored(
            _reportId,
            _ipfsCid,
            _documentHash,
            _orgName,
            _riskLevel,
            block.timestamp
        );
    }

    // Allows a regulator/auditor to verify and approve a compliance report
    function verifyReport(
        string memory _reportId,
        string memory _remarks
    ) public {

        require(reports[_reportId].exists, "Report not found");
        require(!reports[_reportId].verified, "Already verified");

        reports[_reportId].verified = true;
        reports[_reportId].verifiedBy = msg.sender;
        reports[_reportId].remarks = _remarks;

        emit ReportVerified(
            _reportId,
            msg.sender,
            _remarks,
            block.timestamp
        );
    }

    // Retrieves full report details including verification status
    function getReport(string memory _reportId)
        public
        view
        returns (
            string memory reportId,
            string memory ipfsCid,
            bytes32 documentHash,
            bytes32 orgName,
            string memory riskLevel,
            uint256 timestamp,
            bool verified,
            address verifiedBy,
            string memory remarks
        )
    {
        require(reports[_reportId].exists, "Report not found");

        Report memory r = reports[_reportId];

        return (
            r.reportId,
            r.ipfsCid,
            r.documentHash,
            r.orgName,
            r.riskLevel,
            r.timestamp,
            r.verified,
            r.verifiedBy,
            r.remarks
        );
    }
}