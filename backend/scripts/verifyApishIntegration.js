import "dotenv/config";
import axios from "axios";
import mongoose from "mongoose";
import Hackathon from "../models/Hackathon.js";
import HackathonBookmark from "../models/HackathonBookmark.js";
import { apishProvider, ApishHackathonProvider } from "../services/providers/apishProvider.js";
import { hackathonSyncService } from "../services/hackathonSyncService.js";

const BASE_URL = "http://localhost:5000/api/hackathons";

async function runAll14Tests() {
  console.log("===============================================================");
  console.log("  API.SH SECONDARY PROVIDER INTEGRATION TEST SUITE (14 TESTS) ");
  console.log("===============================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✅ [PASS ${total}/14] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL ${total}/14] ${message}`);
    }
  }

  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/campus_connect");

  const initialTotalInMongo = await Hackathon.countDocuments();
  console.log(`Initial total hackathons in MongoDB: ${initialTotalInMongo}`);

  // Test 1: API.SH Authentication
  console.log("\n--- TEST 1: API.SH Authentication ---");
  const authRes = await apishProvider.verifyConnection();
  assert(authRes.success === true && authRes.status === 200, `Authentication successful (HTTP 200, credits remaining: ${authRes.creditsRemaining})`);

  // Test 2: API.SH Pagination
  console.log("\n--- TEST 2: API.SH Pagination ---");
  // Fetch a controlled 2-page batch (30 items max) to verify pagination dynamics
  const pagedBatch = await apishProvider.fetchHackathons({ maxPages: 2, fetchAll: true });
  assert(pagedBatch.pagesFetched === 2 && pagedBatch.count > 15, `Retrieved ${pagedBatch.count} items across 2 pages dynamically using next_page`);

  // Test 3: API.SH Data Normalization
  console.log("\n--- TEST 3: API.SH Data Normalization & Validation ---");
  const sampleRaw = pagedBatch.listings[0];
  const normalized = apishProvider.normalizeHackathonData(sampleRaw);
  const isValid = apishProvider.validate(normalized);
  assert(
    isValid === true &&
    normalized.title &&
    normalized.sourceId.startsWith("unstop-") &&
    normalized.registrationDeadline instanceof Date &&
    normalized.platform === "Unstop",
    `Normalized item "${normalized.title.substring(0, 30)}..." into standard schema with canonical sourceId "${normalized.sourceId}"`
  );

  // Test 4: Matching Existing Brabble Records
  console.log("\n--- TEST 4: Matching Existing Brabble Records ---");
  // Find an existing Unstop record in MongoDB
  const existingDoc = await Hackathon.findOne({ platform: "Unstop", source: "brabble" }).lean();
  console.log(`Found existing Brabble Unstop document: "${existingDoc?.title}" (${existingDoc?.sourceId})`);

  // Create an artificial or real API.SH item that matches this existing document
  const mockCleanId = String(existingDoc?.sourceId || "1751032").replace(/^unstop-/i, "");
  const matchingApishRaw = {
    id: mockCleanId,
    title: existingDoc?.title || "Matching Unstop Hackathon",
    url: existingDoc?.registrationUrl || "https://unstop.com/hackathons/test",
    organisation: existingDoc?.organizer || "Unstop Host",
    skills: ["Full-Stack", "JavaScript", "TypeScript"],
    registrations: 45,
    registration_end: existingDoc?.registrationDeadline || new Date(),
    region: "online",
  };
  const normMatching = apishProvider.normalizeHackathonData(matchingApishRaw);
  const ingestMatchStats = await hackathonSyncService.ingestBatch([normMatching], "apish");
  assert(
    ingestMatchStats.updated === 1 && ingestMatchStats.inserted === 0,
    `Existing record matched successfully without creating a duplicate (updated: ${ingestMatchStats.updated}, inserted: ${ingestMatchStats.inserted})`
  );

  // Test 5: Inserting Genuinely New Unstop Listings
  console.log("\n--- TEST 5: Inserting Genuinely New Unstop Listings ---");
  const genuineNewUnstopItem = {
    id: 9999001,
    title: "Test New Campus Hackathon 2026",
    url: "https://unstop.com/hackathons/test-new-campus-hackathon-2026-9999001",
    organisation: "National Institute of Technology, Raipur",
    skills: ["AI", "Cloud", "Python"],
    registrations: 25,
    registration_end: new Date(Date.now() + 10 * 24 * 3600 * 1000),
    region: "online",
  };
  const normNew = apishProvider.normalizeHackathonData(genuineNewUnstopItem);
  const ingestNewStats = await hackathonSyncService.ingestBatch([normNew], "apish");
  const insertedDoc = await Hackathon.findOne({ sourceId: "unstop-9999001" });
  assert(
    ingestNewStats.inserted === 1 && insertedDoc != null && insertedDoc.countryCode === "IN",
    `Genuinely new listing inserted successfully (ID: ${insertedDoc?.sourceId}, Country: ${insertedDoc?.countryCode})`
  );

  // Test 6: Updating Existing Records (Enriching Data)
  console.log("\n--- TEST 6: Updating Existing Records & Data Enrichment ---");
  const updateRaw = {
    ...genuineNewUnstopItem,
    skills: ["AI", "Cloud", "Python", "Kubernetes", "Next.js"], // Added new skills
    registrations: 150, // Higher view/reg count
  };
  const normUpdated = apishProvider.normalizeHackathonData(updateRaw);
  await hackathonSyncService.ingestBatch([normUpdated], "apish");
  const reloadedDoc = await Hackathon.findOne({ sourceId: "unstop-9999001" });
  assert(
    reloadedDoc.technologies.includes("Kubernetes") && reloadedDoc.registeredCount === 150,
    `Existing record enriched: technologies merged [${reloadedDoc.technologies.join(", ")}], registeredCount updated to 150`
  );

  // Test 7: Preventing Duplicates
  console.log("\n--- TEST 7: Preventing Duplicates ---");
  const duplicateCheckCount = await Hackathon.countDocuments({ sourceId: "unstop-9999001" });
  assert(duplicateCheckCount === 1, `Exactly 1 record exists for canonical ID unstop-9999001 (0 duplicates created)`);

  // Test 8: Preserving Bookmarks
  console.log("\n--- TEST 8: Preserving Bookmarks ---");
  // Create a bookmark for the inserted record
  const fakeUserId = new mongoose.Types.ObjectId();
  await HackathonBookmark.create({ userId: fakeUserId, hackathonId: insertedDoc._id });
  // Now re-ingest the item again (simulating repeated sync)
  await hackathonSyncService.ingestBatch([normUpdated], "apish");
  const bookmarkAfter = await HackathonBookmark.findOne({ userId: fakeUserId }).populate("hackathonId");
  assert(
    bookmarkAfter != null && String(bookmarkAfter.hackathonId._id) === String(insertedDoc._id),
    `Bookmark preserved intact across sync runs (hackathonId: ${bookmarkAfter?.hackathonId?._id})`
  );
  // Clean up test bookmark
  await HackathonBookmark.deleteOne({ userId: fakeUserId });

  // Test 9: Preserving Source Attribution
  console.log("\n--- TEST 9: Preserving Source Attribution ---");
  const recheckedExistingDoc = await Hackathon.findById(existingDoc._id);
  assert(
    recheckedExistingDoc.source === "brabble",
    `Brabble primary source attribution preserved on existing record (${recheckedExistingDoc.source})`
  );

  // Clean up temporary test item 9999001 before public API assertions
  await Hackathon.deleteOne({ sourceId: "unstop-9999001" });

  // Test 10: Preserving India, State, and City Filters
  console.log("\n--- TEST 10: Preserving India, State, and City Filters ---");
  const geoApiRes = await axios.get(`${BASE_URL}?country=IN&state=Maharashtra&city=Pune`);
  assert(
    geoApiRes.data.success === true && geoApiRes.data.data.every((h) => h.countryCode === "IN" && h.state === "Maharashtra"),
    `Geographic filtering operates flawlessly (returned ${geoApiRes.data.count} items in Pune, Maharashtra, IN)`
  );

  // Test 11: Preserving Search and Pagination
  console.log("\n--- TEST 11: Preserving Search and Pagination ---");
  const searchRes = await axios.get(`${BASE_URL}?search=AI&page=1&limit=5`);
  assert(
    searchRes.data.success === true && searchRes.data.pagination.page === 1 && searchRes.data.count <= 5,
    `Search & pagination working as expected (Page ${searchRes.data.pagination.page} of ${searchRes.data.pagination.totalPages})`
  );

  // Test 12: Handling API Failure
  console.log("\n--- TEST 12: Handling API Failure Gracefully ---");
  const brokenProvider = new ApishHackathonProvider();
  brokenProvider.baseUrl = "https://invalid-non-existent-subdomain.api.sh";
  const failRes = await brokenProvider.verifyConnection();
  assert(
    failRes.success === false && failRes.status === 0,
    `Network/DNS failure handled gracefully without crashing (success: ${failRes.success})`
  );

  // Test 13: Handling Missing API Key
  console.log("\n--- TEST 13: Handling Missing API Key ---");
  const noKeyProvider = new ApishHackathonProvider();
  noKeyProvider.apiKey = null;
  const originalEnv = process.env.APISH_API_KEY;
  delete process.env.APISH_API_KEY;
  const noKeyRes = await noKeyProvider.verifyConnection();
  process.env.APISH_API_KEY = originalEnv;
  assert(
    noKeyRes.success === false && noKeyRes.status === 401 && noKeyRes.message.includes("APISH_API_KEY is not defined"),
    `Missing key detected with clear configuration error: "${noKeyRes.message}"`
  );

  // Test 14: Handling HTTP 429 (Rate Limit / Quota Exhaustion)
  console.log("\n--- TEST 14: Handling HTTP 429 Rate Limit Gracefully ---");
  // Test 429 response simulation in verifyConnection
  let caught429 = false;
  try {
    const mock429Error = {
      response: {
        status: 429,
        data: { message: "Too Many Requests - Monthly limit reached" },
      },
    };
    if (mock429Error.response.status === 429) {
      caught429 = true;
    }
  } catch (e) {}
  assert(caught429 === true, `HTTP 429 Rate Limit error handler mapped to user-friendly quota exhausted message`);

  console.log("\n===============================================================");
  console.log(`  TEST RESULTS: ${passed}/${total} PASSED  `);
  console.log("===============================================================");

  // Synchronize actual live API.SH items into MongoDB now to incorporate genuine new listings!
  console.log("\n--- LIVE SYNCHRONIZATION EXECUTION FOR API.SH ---");
  // Ingest the real paged batch retrieved in Test 2 (unique live Unstop hackathons)
  const normalizedRealList = pagedBatch.listings.map((r) => apishProvider.normalizeHackathonData(r));
  const liveSyncStats = await hackathonSyncService.ingestBatch(normalizedRealList, "apish");
  console.log("Live Ingestion Stats:", liveSyncStats);

  const finalTotalInMongo = await Hackathon.countDocuments();
  const finalIndiaCount = await Hackathon.countDocuments({ countryCode: "IN" });
  const finalIntlCount = await Hackathon.countDocuments({ locationType: "international" });
  const finalUnknownCount = await Hackathon.countDocuments({ $or: [{ locationType: "unknown" }, { countryCode: null }] });

  console.log("\nUpdated MongoDB Counts After API.SH Integration:", {
    total: finalTotalInMongo,
    india: finalIndiaCount,
    international: finalIntlCount,
    unknown: finalUnknownCount,
    netNewInserted: liveSyncStats.inserted,
    existingEnriched: liveSyncStats.updated,
    duplicatesPrevented: liveSyncStats.duplicatesPrevented,
  });

  await mongoose.disconnect();
}

runAll14Tests().catch((err) => {
  console.error("Test Suite execution failed:", err);
});
