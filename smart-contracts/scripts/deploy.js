const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const admin = deployer.address;

  console.log("Deploying with account:", admin);

  const Carbon = await hre.ethers.getContractFactory("CarbonCreditToken");
  const carbon = await Carbon.deploy("BlueCarbonCredit", "BCC", admin);
  await carbon.deployed();
  console.log("CarbonCreditToken deployed to:", carbon.address);

  const Registry = await hre.ethers.getContractFactory("MRVRegistry");
  const registry = await Registry.deploy(carbon.address, admin);
  await registry.deployed();
  console.log("MRVRegistry deployed to:", registry.address);

  // grant registry the MINTER_ROLE on the token
  const MINTER_ROLE = hre.ethers.utils.keccak256(hre.ethers.utils.toUtf8Bytes("MINTER_ROLE"));
  const grantTx = await carbon.grantRole(MINTER_ROLE, registry.address);
  await grantTx.wait();
  console.log("Granted MINTER_ROLE to registry:", registry.address);

  console.log("Deployment complete.");
}

main()
  .then(()=>process.exit(0))
  .catch(e=>{console.error(e); process.exit(1);});
