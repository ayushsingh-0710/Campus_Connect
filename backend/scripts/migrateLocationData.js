import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Hackathon from "../models/Hackathon.js";
import { classifyLocation } from "../utils/geographicData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../.env") });

export const migrateLocationData = async () => {
  console.log("\n=======================================================");
  console.log("   Campus Connect - Location Backfill & Migration    ");
  console.log("=======================================================\n");

  await connectDB();

  const allRecords = await Hackathon.find();
  console.log(`Found ${allRecords.length} records to inspect and classify...`);

  let domesticCount = 0;
  let internationalCount = 0;
  let unknownCount = 0;
  let stateAssignedCount = 0;
  let cityAssignedCount = 0;

  for (const record of allRecords) {
    const geo = classifyLocation({
      title: record.title,
      organizer: record.organizer,
      location: record.location,
      eligibility: record.eligibility,
      platform: record.platform,
    });

    record.country = geo.country;
    record.countryCode = geo.countryCode;
    record.state = geo.state;
    record.stateCode = geo.stateCode;
    record.city = geo.city;
    record.locationType = geo.locationType;
    record.countryDetectionMethod = geo.countryDetectionMethod;

    await record.save();

    if (geo.countryCode === "IN") domesticCount++;
    else if (geo.locationType === "international") internationalCount++;
    else unknownCount++;

    if (geo.state) stateAssignedCount++;
    if (geo.city) cityAssignedCount++;
  }

  console.log("\n[Migration Completed Successfully]");
  console.log(`- Total Records Processed:   ${allRecords.length}`);
  console.log(`- Verified India-based (IN): ${domesticCount}`);
  console.log(`- International Records:     ${internationalCount}`);
  console.log(`- Unknown / Unspecified:     ${unknownCount}`);
  console.log(`- Records with State:        ${stateAssignedCount}`);
  console.log(`- Records with City:         ${cityAssignedCount}`);
  console.log("=======================================================\n");

  return {
    total: allRecords.length,
    domesticCount,
    internationalCount,
    unknownCount,
    stateAssignedCount,
    cityAssignedCount,
  };
};

// If run directly from terminal
if (process.argv[1] && process.argv[1].endsWith("migrateLocationData.js")) {
  migrateLocationData()
    .then(async () => {
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error("[Migration Error]", err);
      await mongoose.disconnect();
      process.exit(1);
    });
}

export default migrateLocationData;
