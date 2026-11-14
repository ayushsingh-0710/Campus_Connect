import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

const testSuite = async () => {
  console.log("\n==================================================");
  console.log("   Campus Connect - Hackathons Full Test Suite    ");
  console.log("==================================================\n");

  const results = {};

  // 1. Health check
  try {
    const res = await axios.get(`${BASE_URL}/health`);
    results.healthCheck = { status: res.status, ok: res.data.status === "ok" };
  } catch (e) {
    results.healthCheck = { error: e.message };
  }

  // 2. Discover / Public listings
  try {
    const res = await axios.get(`${BASE_URL}/hackathons?limit=12`);
    results.discoveryListing = {
      status: res.status,
      count: res.data.count,
      total: res.data.pagination.total,
      hasAttribution: Boolean(res.data.attribution),
      firstListingTitle: res.data.data[0]?.title,
      firstListingPlatform: res.data.data[0]?.platform,
      firstListingIsDemo: res.data.data[0]?.isDemo,
    };
  } catch (e) {
    results.discoveryListing = { error: e.message };
  }

  // 3. Search: by title keyword "NASA"
  try {
    const res = await axios.get(`${BASE_URL}/hackathons?search=NASA`);
    results.searchTitle = {
      status: res.status,
      count: res.data.count,
      matched: res.data.data.map((h) => h.title),
    };
  } catch (e) {
    results.searchTitle = { error: e.message };
  }

  // 4. Search: by organizer keyword
  try {
    const res = await axios.get(`${BASE_URL}/hackathons?search=Aditya`);
    results.searchOrganizer = {
      status: res.status,
      count: res.data.count,
      matched: res.data.data.map((h) => `${h.title} (by ${h.organizer})`),
    };
  } catch (e) {
    results.searchOrganizer = { error: e.message };
  }

  // 5. Mode Filters
  try {
    const online = await axios.get(`${BASE_URL}/hackathons?mode=Online&limit=5`);
    const offline = await axios.get(`${BASE_URL}/hackathons?mode=Offline&limit=5`);
    const hybrid = await axios.get(`${BASE_URL}/hackathons?mode=Hybrid&limit=5`);
    results.modeFilters = {
      onlineCount: online.data.pagination.total,
      offlineCount: offline.data.pagination.total,
      hybridCount: hybrid.data.pagination.total,
    };
  } catch (e) {
    results.modeFilters = { error: e.message };
  }

  // 6. Category Filter: "Blockchain"
  try {
    const res = await axios.get(`${BASE_URL}/hackathons?category=Blockchain&limit=5`);
    results.categoryFilter = {
      total: res.data.pagination.total,
      sample: res.data.data.slice(0, 3).map((h) => ({ title: h.title, categories: h.categories })),
    };
  } catch (e) {
    results.categoryFilter = { error: e.message };
  }

  // 7. Compound Multi-filter: Mode=Online + Category=Artificial Intelligence
  try {
    const res = await axios.get(
      `${BASE_URL}/hackathons?mode=Online&category=Artificial%20Intelligence&limit=5`
    );
    results.compoundFilter = {
      total: res.data.pagination.total,
      sample: res.data.data.slice(0, 2).map((h) => ({
        title: h.title,
        mode: h.mode,
        categories: h.categories,
      })),
    };
  } catch (e) {
    results.compoundFilter = { error: e.message };
  }

  // 8. Sorting: Prize High
  try {
    const res = await axios.get(`${BASE_URL}/hackathons?sort=prize-high&limit=3`);
    results.sortPrizeHigh = res.data.data.map((h) => ({
      title: h.title,
      prizeAmount: h.prizePool?.amount,
      prizeLabel: h.prizePool?.label,
    }));
  } catch (e) {
    results.sortPrizeHigh = { error: e.message };
  }

  // 9. Sorting: Registration Deadline
  try {
    const res = await axios.get(`${BASE_URL}/hackathons?sort=deadline&limit=3`);
    results.sortDeadline = res.data.data.map((h) => ({
      title: h.title,
      deadline: h.registrationDeadline,
    }));
  } catch (e) {
    results.sortDeadline = { error: e.message };
  }

  // 10. Pagination: Page 2
  try {
    const p1 = await axios.get(`${BASE_URL}/hackathons?page=1&limit=5`);
    const p2 = await axios.get(`${BASE_URL}/hackathons?page=2&limit=5`);
    results.paginationTest = {
      p1FirstId: p1.data.data[0]?.slug,
      p2FirstId: p2.data.data[0]?.slug,
      isDifferent: p1.data.data[0]?.slug !== p2.data.data[0]?.slug,
      p1Total: p1.data.pagination.total,
      p2Page: p2.data.pagination.page,
    };
  } catch (e) {
    results.paginationTest = { error: e.message };
  }

  // 11. Details and Registration Links
  try {
    const listRes = await axios.get(`${BASE_URL}/hackathons?limit=1`);
    const sample = listRes.data.data[0];
    const detailRes = await axios.get(`${BASE_URL}/hackathons/${sample.slug}`);

    results.detailsTest = {
      title: detailRes.data.data.title,
      organizer: detailRes.data.data.organizer,
      platform: detailRes.data.data.platform,
      registrationUrlValid: Boolean(detailRes.data.data.registrationUrl?.startsWith("http")),
      registrationUrl: detailRes.data.data.registrationUrl,
      sourceUrl: detailRes.data.data.sourceUrl,
      mode: detailRes.data.data.mode,
      prizePool: detailRes.data.data.prizePool,
      teamSize: detailRes.data.data.teamSize,
      eligibility: detailRes.data.data.eligibility,
      startDate: detailRes.data.data.startDate || "Not specified",
    };
  } catch (e) {
    results.detailsTest = { error: e.message };
  }

  // 12. Bookmarks Lifecycle (Save, Check, List, Remove, Check)
  const testStudentId = "test-student-end2end-999";
  const authHeaders = { "x-user-id": testStudentId };
  try {
    const listRes = await axios.get(`${BASE_URL}/hackathons?limit=1`);
    const hackathonToSave = listRes.data.data[0];
    const targetSlug = hackathonToSave.slug;

    // Save
    const saveRes = await axios.post(`${BASE_URL}/hackathons/${targetSlug}/bookmark`, {}, { headers: authHeaders });
    // Check
    const check1 = await axios.get(`${BASE_URL}/hackathons/${targetSlug}/bookmark`, { headers: authHeaders });
    // Saved List
    const savedList = await axios.get(`${BASE_URL}/hackathons/saved`, { headers: authHeaders });
    // Remove
    const removeRes = await axios.delete(`${BASE_URL}/hackathons/${targetSlug}/bookmark`, { headers: authHeaders });
    // Check again
    const check2 = await axios.get(`${BASE_URL}/hackathons/${targetSlug}/bookmark`, { headers: authHeaders });

    results.bookmarkLifecycle = {
      saveStatus: saveRes.status === 201,
      checkedAfterSave: check1.data.bookmarked === true,
      savedListCount: savedList.data.count,
      savedItemMatched: savedList.data.data[0]?.slug === targetSlug,
      removeStatus: removeRes.data.removed === true,
      checkedAfterRemove: check2.data.bookmarked === false,
    };
  } catch (e) {
    results.bookmarkLifecycle = { error: e.message };
  }

  // 13. Telemetry & Sync Status
  try {
    const syncRes = await axios.get(`${BASE_URL}/hackathons/sync/status`);
    results.syncTelemetry = {
      status: syncRes.status,
      hasLastSync: Boolean(syncRes.data.lastSync),
      syncedCount: syncRes.data.lastSync?.syncedCount,
      totalAvailable: syncRes.data.lastSync?.totalAvailable,
      provider: syncRes.data.lastSync?.provider,
    };
  } catch (e) {
    results.syncTelemetry = { error: e.message };
  }

  console.log(JSON.stringify(results, null, 2));
};

testSuite().catch(console.error);
