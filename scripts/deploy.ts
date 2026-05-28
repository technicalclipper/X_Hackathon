import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "OKB");

  console.log("\n=== Deploying country tokens ===");
  const Arg = await ethers.getContractFactory("ArgentinaFanToken");
  const arg = await Arg.deploy();
  await arg.waitForDeployment();
  const argAddr = await arg.getAddress();
  console.log("ArgentinaFanToken:", argAddr);

  const Bra = await ethers.getContractFactory("BrazilFanToken");
  const bra = await Bra.deploy();
  await bra.waitForDeployment();
  const braAddr = await bra.getAddress();
  console.log("BrazilFanToken:   ", braAddr);

  const Fra = await ethers.getContractFactory("FranceFanToken");
  const fra = await Fra.deploy();
  await fra.waitForDeployment();
  const fraAddr = await fra.getAddress();
  console.log("FranceFanToken:   ", fraAddr);

  console.log("\n=== Deploying FanEngagementPool ===");
  const Pool = await ethers.getContractFactory("FanEngagementPool");
  const pool = await Pool.deploy();
  await pool.waitForDeployment();
  const poolAddr = await pool.getAddress();
  console.log("FanEngagementPool:", poolAddr);

  console.log("\n=== Registering tokens ===");
  await (await pool.addFanToken(argAddr)).wait();
  console.log("Registered ARG");
  await (await pool.addFanToken(braAddr)).wait();
  console.log("Registered BRA");
  await (await pool.addFanToken(fraAddr)).wait();
  console.log("Registered FRA");

  console.log("\n=== ENV VARS ===");
  console.log(`NEXT_PUBLIC_FAN_ART_CONTRACT_ADDRESS=${poolAddr}`);
  console.log(`NEXT_PUBLIC_ARG_TOKEN_ADDRESS=${argAddr}`);
  console.log(`NEXT_PUBLIC_BRA_TOKEN_ADDRESS=${braAddr}`);
  console.log(`NEXT_PUBLIC_FRA_TOKEN_ADDRESS=${fraAddr}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
