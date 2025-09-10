const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MRVRegistry", function () {
  let Carbon, carbon, Registry, registry;
  let admin, verifier, uploader, project;

  beforeEach(async function () {
    [admin, verifier, uploader, project] = await ethers.getSigners();

    Carbon = await ethers.getContractFactory("CarbonCreditToken");
    carbon = await Carbon.deploy("BlueCarbonCredit", "BCC", admin.address);
    await carbon.deployed();

    Registry = await ethers.getContractFactory("MRVRegistry");
    registry = await Registry.deploy(carbon.address, admin.address);
    await registry.deployed();

    // grant registry the MINTER_ROLE on token
    const MINTER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE"));
    await carbon.grantRole(MINTER_ROLE, registry.address);

    // grant a verifier role to 'verifier'
    const VERIFIER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("VERIFIER_ROLE"));
    await registry.connect(admin).grantRole(VERIFIER_ROLE, verifier.address);
  });

  it("submitMRV creates a record", async function () {
    const ipfs = "QmFakeCid";
    const estCarbon = ethers.BigNumber.from("1000"); // units should match token decimals choice
    const tx = await registry.connect(uploader).submitMRV(project.address, ipfs, estCarbon);
    const receipt = await tx.wait();

    // recordCounter should be 1
    expect(await registry.recordCounter()).to.equal(1);

    const r = await registry.records(1);
    expect(r.project).to.equal(project.address);
    expect(r.ipfsHash).to.equal(ipfs);
    expect(r.estCarbon).to.equal(estCarbon);
    expect(r.minted).to.equal(false);
  });

  it("only verifier can approveAndMint and token minted", async function () {
    const ipfs = "QmFakeCid";
    const estCarbon = ethers.BigNumber.from("1000");
    await registry.connect(uploader).submitMRV(project.address, ipfs, estCarbon);

    // Try approving with someone else (uploader) -> should revert
    await expect(registry.connect(uploader).approveAndMint(1, project.address)).to.be.revertedWith("MRVRegistry: caller is not a verifier");

    // Approve with verifier
    await registry.connect(verifier).approveAndMint(1, project.address);

    // token minted to project
    expect(await carbon.balanceOf(project.address)).to.equal(estCarbon);

    const r = await registry.records(1);
    expect(r.minted).to.equal(true);
    expect(r.mintedAmount).to.equal(estCarbon);
    expect(r.mintedTo).to.equal(project.address);
  });
});
