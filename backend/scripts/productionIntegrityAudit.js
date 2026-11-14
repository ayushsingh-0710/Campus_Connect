import "dotenv/config";
import axios from "axios";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import Hackathon from "../models/Hackathon.js";
import HackathonBookmark from "../models/HackathonBookmark.js";
import { apishProvider } from "../services/providers/apishProvider.js";
import { brabbleProvider } from "../services/providers/brabbleProvider.js";
import { hackathonSyncService } from "../services/hackathonSyncService.js";

const BASE_URL = "http://localhost:5000/api/hackathons";

async function executeAudit() {
  console.log("=================================================================");
  console.log("  CAMPUS CONNECT: POST-INTEGRATION PRODUCTION INTEGRITY AUDIT   ");
  console.log("=================================================================\n");

  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/campus_connect");

  const results = {};

  // -------------------------------------------------------------
  // CHECK 1 & 2: API.SH Credits Reconciliation & Live Header Check
  // -------------------------------------------------------------
  console.log("--- CHECK 1 & 2: API.SH Credit Reconciliation & Live Header ---");
  let liveAuth;
  try {
    const res = await axios.get("https://api.api.sh/unstop/v1/search", {
      headers: { "x-api-key": process.env.APISH_API_KEY, Accept: "application/json" },
      params: { type: "hackathons", status: "open", limit: 1, page: 1 },
      timeout: 10000,
    });
    liveAuth = {
      status: res.status,
      creditsUsedHeader: res.headers["x-credits-used"],
      creditsRemainingHeader: res.headers["x-credits-remaining"],
      totalReported: res.data.total,
    };
  } catch (err) {
    liveAuth = { error: err.message };
  }

  results.credits = {
    liveHeader: liveAuth,
    reconciliationAudit: {
      initialFreeCredits: 1000,
      phase1Diagnostic: 1, // 1 test request (page 1) -> remaining: 999
      phase2PaginationDiagnostic: 5, // 5 pages retrieved -> remaining: 994
      testSuiteRun1: 3, // 1 auth check + 2 pages pagedBatch -> remaining: 991
      testSuiteRun2: 3, // 1 auth check + 2 pages pagedBatch -> remaining: 988
      manualSyncCurlTest: 1, // 1 manual sync call (page 1) -> remaining: 987
      auditLiveCheck: 1, // this live verification call -> remaining: 986
      totalConsumedToDate: 14,
      expectedRemaining: 986,
      actualLiveRemaining: Number(liveAuth.creditsRemainingHeader),
      isReconciled: Number(liveAuth.creditsRemainingHeader) === 986 || Math.abs(Number(liveAuth.creditsRemainingHeader) - 986) <= 2,
    },
  };
  console.log("Credit Audit Result:", JSON.stringify(results.credits, null, 2));

  // -------------------------------------------------------------
  // CHECK 3: Verify Test Record unstop-9999001 Was Removed
  // -------------------------------------------------------------
  console.log("\n--- CHECK 3: Test Record unstop-9999001 Verification ---");
  const testRecord = await Hackathon.findOne({
    $or: [
      { sourceId: "unstop-9999001" },
      { sourceId: "9999001" },
      { title: /Test New Campus Hackathon/i },
    ],
  }).lean();

  results.testRecordCleanup = {
    found: Boolean(testRecord),
    details: testRecord ? { id: testRecord._id, title: testRecord.title } : null,
    passed: testRecord === null,
  };
  console.log("Test record cleanup check passed:", results.testRecordCleanup.passed);

  // -------------------------------------------------------------
  // CHECK 4: Confirm Total Unique MongoDB Records is 394
  // -------------------------------------------------------------
  console.log("\n--- CHECK 4: Total Unique Records & Duplicate Check ---");
  const totalCount = await Hackathon.countDocuments();
  const demoCount = await Hackathon.countDocuments({ isDemo: true });
  const liveCount = await Hackathon.countDocuments({ isDemo: false });

  // Check unique slugs
  const slugCounts = await Hackathon.aggregate([
    { $group: { _id: "$slug", count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
  ]);

  results.uniqueRecords = {
    total: totalCount,
    demo: demoCount,
    live: liveCount,
    duplicateSlugsFound: slugCounts.length,
    passed: totalCount === 394 && slugCounts.length === 0,
  };
  console.log("Total unique records:", results.uniqueRecords);

  // -------------------------------------------------------------
  // CHECK 5: API.SH Pagination Completeness & maxPages Handling
  // -------------------------------------------------------------
  console.log("\n--- CHECK 5: API.SH Pagination Logic & Termination ---");
  const apishProviderSource = fs.readFileSync(
    path.resolve("services/providers/apishProvider.js"),
    "utf-8"
  );
  const hasDynamicNextPage = apishProviderSource.includes("data.next_page");
  const hasMaxPagesSafety = apishProviderSource.includes("maxPages");
  const hasPaginationBreak = apishProviderSource.includes("if (!fetchAll || !nextPage)");

  results.paginationLogic = {
    dynamicNextPageTracking: hasDynamicNextPage,
    maxPagesSafetyCeiling: hasMaxPagesSafety,
    properLoopTermination: hasPaginationBreak,
    passed: hasDynamicNextPage && hasMaxPagesSafety && hasPaginationBreak,
  };
  console.log("Pagination logic audit:", results.paginationLogic);

  // -------------------------------------------------------------
  // CHECK 6: Cron Schedules Verification (Brabble 6h, API.SH daily 3am)
  // -------------------------------------------------------------
  console.log("\n--- CHECK 6: Cron Schedules Verification ---");
  const syncServiceSource = fs.readFileSync(
    path.resolve("services/hackathonSyncService.js"),
    "utf-8"
  );
  const hasBrabble6HourCron = syncServiceSource.includes('"0 */6 * * *"');
  const hasApishDailyCron = syncServiceSource.includes('"0 3 * * *"');

  results.cronSchedules = {
    brabbleSchedule: hasBrabble6HourCron ? "0 */6 * * * (Every 6 hours)" : "Missing",
    apishSchedule: hasApishDailyCron ? "0 3 * * * (Once daily at 3:00 AM)" : "Missing",
    passed: hasBrabble6HourCron && hasApishDailyCron,
  };
  console.log("Cron schedules audit:", results.cronSchedules);

  // -------------------------------------------------------------
  // CHECK 7: Concurrency Protection Test (isSyncing flag)
  // -------------------------------------------------------------
  console.log("\n--- CHECK 7: Concurrency Protection Test ---");
  // Set isSyncing to true artificially and verify syncFromProvider rejects with { inProgress: true }
  hackathonSyncService.isSyncing = true;
  const concurrentAttempt = await hackathonSyncService.syncFromProvider("apish");
  hackathonSyncService.isSyncing = false; // Reset back to false

  results.concurrencyProtection = {
    attemptReturned: concurrentAttempt,
    passed: concurrentAttempt?.inProgress === true,
  };
  console.log("Concurrency test passed:", results.concurrencyProtection.passed);

  // -------------------------------------------------------------
  // CHECK 8: Bookmark Integrity (Zero Orphaned Bookmarks)
  // -------------------------------------------------------------
  console.log("\n--- CHECK 8: Bookmark Integrity Verification ---");
  const totalBookmarks = await HackathonBookmark.countDocuments();
  const allBookmarks = await HackathonBookmark.find().populate("hackathonId").lean();
  const orphanedBookmarks = allBookmarks.filter((b) => !b.hackathonId);

  results.bookmarks = {
    totalBookmarks,
    orphanedCount: orphanedBookmarks.length,
    passed: orphanedBookmarks.length === 0,
  };
  console.log("Bookmark integrity audit:", results.bookmarks);

  // -------------------------------------------------------------
  // CHECK 9: Unstop Duplicate Verification in MongoDB
  // -------------------------------------------------------------
  console.log("\n--- CHECK 9: Unstop Duplicate Verification in MongoDB ---");
  const unstopDocs = await Hackathon.find(
    { $or: [{ platform: "Unstop" }, { sourceId: /^unstop-/i }] },
    { sourceId: 1, title: 1, registrationUrl: 1, sourceUrl: 1 }
  ).lean();

  const idMap = new Map();
  const duplicates = [];

  for (const doc of unstopDocs) {
    const cleanId = String(doc.sourceId || "").replace(/^unstop-/i, "");
    if (cleanId) {
      if (idMap.has(cleanId)) {
        duplicates.push({ cleanId, existing: idMap.get(cleanId), duplicate: doc });
      } else {
        idMap.set(cleanId, doc);
      }
    }
  }

  results.unstopDeduplication = {
    totalUnstopListingsInMongo: unstopDocs.length,
    uniqueUnstopIds: idMap.size,
    duplicateCount: duplicates.length,
    passed: duplicates.length === 0 && unstopDocs.length === 170,
  };
  console.log("Unstop deduplication audit:", results.unstopDeduplication);

  // -------------------------------------------------------------
  // CHECK 10: Verify 148 India Records & Geographic Accuracy
  // -------------------------------------------------------------
  console.log("\n--- CHECK 10: Geographic Classification & 148 India Records ---");
  const indiaDocs = await Hackathon.find({ countryCode: "IN" }).lean();
  const indiaDomesticMismatch = indiaDocs.filter((d) => d.locationType !== "domestic");
  const nullCountryCodeInDomestic = await Hackathon.countDocuments({
    locationType: "domestic",
    countryCode: { $ne: "IN" },
  });

  const stateAgg = await Hackathon.aggregate([
    { $match: { countryCode: "IN", state: { $ne: null } } },
    { $group: { _id: "$state", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const cityCount = await Hackathon.countDocuments({ countryCode: "IN", city: { $ne: null } });

  results.geographicIntegrity = {
    indiaCount: indiaDocs.length,
    domesticMismatch: indiaDomesticMismatch.length,
    nullCountryMismatch: nullCountryCodeInDomestic,
    distinctStates: stateAgg.length,
    recordsWithCity: cityCount,
    topStates: stateAgg.slice(0, 5).map((s) => ({ state: s._id, count: s.count })),
    passed: indiaDocs.length === 148 && indiaDomesticMismatch.length === 0 && nullCountryCodeInDomestic === 0,
  };
  console.log("Geographic integrity audit:", results.geographicIntegrity);

  // -------------------------------------------------------------
  // CHECK 11: Admin Sync Status Endpoint Verification
  // -------------------------------------------------------------
  console.log("\n--- CHECK 11: Admin Sync Status Endpoint Verification ---");
  let syncStatusRes;
  try {
    const res = await axios.get(`${BASE_URL}/sync/status`);
    syncStatusRes = res.data;
  } catch (e) {
    syncStatusRes = { error: e.message };
  }

  results.syncStatusEndpoint = {
    success: syncStatusRes.success === true,
    hasProviders: Boolean(syncStatusRes.providers?.brabble && syncStatusRes.providers?.apish),
    hasApishTelemetry: Boolean(syncStatusRes.apishTelemetry && syncStatusRes.apishTelemetry.provider === "apish"),
    brabbleStats: syncStatusRes.providers?.brabble,
    apishStats: syncStatusRes.providers?.apish,
    apishTelemetry: syncStatusRes.apishTelemetry,
    passed: syncStatusRes.success === true && Boolean(syncStatusRes.providers?.brabble) && Boolean(syncStatusRes.providers?.apish),
  };
  console.log("Sync status endpoint audit:", {
    success: results.syncStatusEndpoint.success,
    hasProviders: results.syncStatusEndpoint.hasProviders,
    passed: results.syncStatusEndpoint.passed,
  });

  // -------------------------------------------------------------
  // CHECK 12: Secret Leakage & API Key Exposure Verification
  // -------------------------------------------------------------
  console.log("\n--- CHECK 12: API Key Exposure & Secret Leakage Check ---");
  const apishKey = process.env.APISH_API_KEY;
  const brabbleKey = process.env.HACKATHON_API_KEY;

  // 12a. Check public hackathons list response
  const hackListRes = await axios.get(`${BASE_URL}?limit=10`);
  const listJson = JSON.stringify(hackListRes.data);
  const keyInList = listJson.includes(apishKey) || listJson.includes(brabbleKey);

  // 12b. Check single hackathon details response
  const sampleDoc = await Hackathon.findOne({ isDemo: false }).lean();
  const detailRes = await axios.get(`${BASE_URL}/${sampleDoc._id}`);
  const detailJson = JSON.stringify(detailRes.data);
  const keyInDetail = detailJson.includes(apishKey) || detailJson.includes(brabbleKey);

  // 12c. Check sync status response
  const syncJson = JSON.stringify(syncStatusRes);
  const keyInSync = syncJson.includes(apishKey) || syncJson.includes(brabbleKey);

  // 12d. Check frontend bundle files for leaked keys
  let keyInFrontendBundle = false;
  const distAssetsDir = path.resolve("../frontend/dist/assets");
  if (fs.existsSync(distAssetsDir)) {
    const files = fs.readdirSync(distAssetsDir);
    for (const file of files) {
      if (file.endsWith(".js") || file.endsWith(".css")) {
        const content = fs.readFileSync(path.join(distAssetsDir, file), "utf-8");
        if (content.includes(apishKey) || content.includes(brabbleKey)) {
          keyInFrontendBundle = true;
          break;
        }
      }
    }
  }

  results.securityAudit = {
    keyExposedInHackathonsList: keyInList,
    keyExposedInHackathonDetails: keyInDetail,
    keyExposedInSyncStatus: keyInSync,
    keyExposedInFrontendBundle: keyInFrontendBundle,
    passed: !keyInList && !keyInDetail && !keyInSync && !keyInFrontendBundle,
  };
  console.log("Security audit passed:", results.securityAudit.passed);

  console.log("\n=================================================================");
  console.log("                 AUDIT EXECUTION COMPLETE                        ");
  console.log("=================================================================");

  await mongoose.disconnect();
  return results;
}

executeAudit()
  .then((res) => {
    fs.writeFileSync("audit_results.json", JSON.stringify(res, null, 2));
  })
  .catch(console.error);
