import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

const SUPABASE_URL = "https://cjickdvjcfcfkbfibunn.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqaWNrZHZqY2ZjZmtiZmlidW5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NjY2NjMsImV4cCI6MjA5NTU0MjY2M30.X6hxtA04jzkjPBnTipbPHpOIPzMtQGrqzmHZut-D56Q";
const POOL_CONTRACT = "0xf569938CdcFa89D7a77a297b399ef1F68505421C";
const CHAIN_ID = 1952;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const pool = await ethers.getContractAt("FanEngagementPool", POOL_CONTRACT);

  // Set deadlines: submission open for 30 days, voting for 60 days
  const now = Math.floor(Date.now() / 1000);
  const submissionDeadline = now + 30 * 24 * 60 * 60;
  const votingDeadline = now + 60 * 24 * 60 * 60;

  console.log("Creating JERSEY pool on-chain...");
  const tx = await pool.createPool(
    2, // JERSEY
    "World Cup 2026 - Kit Design",
    submissionDeadline,
    votingDeadline
  );
  const receipt = await tx.wait();
  console.log("TX hash:", tx.hash);

  // Read pool ID from the PoolCreated event in the receipt for reliability
  const iface = pool.interface;
  let poolId: number | undefined;
  for (const log of receipt!.logs) {
    try {
      const parsed = iface.parseLog({ topics: [...log.topics], data: log.data });
      if (parsed && parsed.name === "PoolCreated") {
        poolId = Number(parsed.args[0]);
        break;
      }
    } catch (_) {}
  }
  if (poolId === undefined) {
    // fallback: read poolCount directly
    poolId = Number(await pool.poolCount());
  }
  console.log("Pool ID:", poolId);

  // Insert into Supabase via REST API (no SDK needed)
  const body = JSON.stringify({
    id: poolId,
    pool_type: "JERSEY",
    match_id: "World Cup 2026 - Kit Design",
    submission_deadline: submissionDeadline,
    voting_deadline: votingDeadline,
    active: true,
    chain_id: CHAIN_ID,
  });

  const res = await fetch(`${SUPABASE_URL}/rest/v1/pools`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Prefer": "return=representation",
    },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase insert failed: ${err}`);
  }

  const data = await res.json();
  console.log("Inserted into Supabase:", data);
  console.log("\nDone! Pool ID:", poolId, "is live on X Layer and in Supabase.");
}

main().catch((e) => { console.error(e); process.exit(1); });
