import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import connectDB from "../config/db.js";
import { hackathonSyncService } from "../services/hackathonSyncService.js";
import Hackathon from "../models/Hackathon.js";
import mongoose from "mongoose";

// Load environment variables from backend/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../.env") });

export const seedHackathons = async () => {
  console.log("\n===============================================");
  console.log("   Campus Connect - Hackathon Seeding Utility  ");
  console.log("===============================================\n");

  await connectDB();

  try {
    const demoStats = await hackathonSyncService.syncFromProvider("demo");

    let liveStats = null;
    if (process.env.HACKATHON_API_KEY) {
      console.log("\n[Live Sync] Found HACKATHON_API_KEY, fetching external live listings...");
      try {
        liveStats = await hackathonSyncService.syncFromProvider("brabble", { limit: 25 });
      } catch (err) {
        console.warn("[Live Sync] External sync warning:", err.message);
      }
    }

    const totalCount = await Hackathon.countDocuments();
    const demoCount = await Hackathon.countDocuments({ isDemo: true });
    const liveCount = totalCount - demoCount;

    console.log("\n[Seed Summary]");
    console.log(`- Demo Records:    ${demoStats.inserted + demoStats.updated}`);
    if (liveStats) {
      console.log(`- Live Imported:   ${liveStats.inserted + liveStats.updated}`);
    }
    console.log(`- Total in DB:     ${totalCount} (${demoCount} demo, ${liveCount} live)`);
    console.log("\nSeeding completed successfully!\n");
    return { demoStats, liveStats };
  } catch (error) {
    console.error("\n[Seed Error] Seeding failed:", error);
    throw error;
  }
};

// If run directly from terminal:
if (process.argv[1] && process.argv[1].endsWith("seedHackathons.js")) {
  seedHackathons()
    .then(async () => {
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch(async (err) => {
      await mongoose.disconnect();
      process.exit(1);
    });
}

export default seedHackathons;
