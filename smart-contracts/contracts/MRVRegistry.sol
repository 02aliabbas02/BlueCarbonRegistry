// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./CarbonCreditToken.sol";

contract MRVRegistry is AccessControl {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    CarbonCreditToken public token;
    uint256 public recordCounter;

    struct Record {
        uint256 id;
        address project;
        string ipfsHash;
        uint256 estCarbon; // must be in token decimals units
        uint256 timestamp;
        bool minted;
        uint256 mintedAmount;
        address mintedTo;
    }

    mapping(uint256 => Record) public records;

    event MRVSubmitted(uint256 indexed id, address indexed project, string ipfsHash, uint256 estCarbon);
    event MRVApproved(uint256 indexed id, address indexed verifier, uint256 amountMinted, address mintedTo, uint256 txTime);

    constructor(address tokenAddress, address admin) {
        token = CarbonCreditToken(tokenAddress);
        _setupRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function submitMRV(address project, string calldata ipfsHash, uint256 estCarbon) external returns (uint256) {
        // allow any uploader to create a record
        recordCounter += 1;
        records[recordCounter] = Record({
            id: recordCounter,
            project: project,
            ipfsHash: ipfsHash,
            estCarbon: estCarbon,
            timestamp: block.timestamp,
            minted: false,
            mintedAmount: 0,
            mintedTo: address(0)
        });
        emit MRVSubmitted(recordCounter, project, ipfsHash, estCarbon);
        return recordCounter;
    }

    function approveAndMint(uint256 recordId, address mintTo) external {
        require(hasRole(VERIFIER_ROLE, msg.sender), "MRVRegistry: caller is not a verifier");
        Record storage r = records[recordId];
        require(!r.minted, "MRVRegistry: already minted");
        require(r.estCarbon > 0, "MRVRegistry: no carbon to mint");

        uint256 amount = r.estCarbon;
        token.mint(mintTo, amount);

        r.minted = true;
        r.mintedAmount = amount;
        r.mintedTo = mintTo;

        emit MRVApproved(recordId, msg.sender, amount, mintTo, block.timestamp);
    }
}
