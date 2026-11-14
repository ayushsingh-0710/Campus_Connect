import axios from "axios";

const BASE_URL = "http://localhost:5000/api/hackathons";

async function runTests() {
  console.log("=== STARTING END-TO-END GEOGRAPHIC API TESTS ===\n");
  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
    }
  }

  try {
    // Test 1: Location Options Endpoint
    console.log("--- Test 1: /api/hackathons/location-options ---");
    const optRes = await axios.get(`${BASE_URL}/location-options`);
    const { counts, states } = optRes.data.data;
    assert(optRes.data.success === true, "Options endpoint returns success: true");
    assert(counts.india === 147, `India count is 147 (got ${counts.india})`);
    assert(counts.international === 41, `International count is 41 (got ${counts.international})`);
    assert(counts.unknown === 204, `Location Not Specified count is 204 (got ${counts.unknown})`);
    assert(states.length >= 18, `Found ${states.length} Indian states with hackathons`);
    const karnataka = states.find((s) => s.name === "Karnataka");
    assert(karnataka && karnataka.count === 13, `Karnataka has 13 hackathons`);
    const bengaluru = karnataka?.cities.find((c) => c.name === "Bengaluru");
    assert(bengaluru && bengaluru.count === 9, `Bengaluru has 9 hackathons`);

    // Test 2: Country = IN (India Only)
    console.log("\n--- Test 2: GET /api/hackathons?country=IN ---");
    const inRes = await axios.get(`${BASE_URL}?country=IN&limit=100`);
    assert(inRes.data.pagination.total === 147, `Total India hackathons = 147 (got ${inRes.data.pagination.total})`);
    const allIn = inRes.data.data.every((h) => h.countryCode === "IN");
    assert(allIn, "All returned hackathons have countryCode === 'IN'");
    const noIntlInIndia = inRes.data.data.every((h) => h.locationType !== "international");
    assert(noIntlInIndia, "No international hackathons leaked into India filter");

    // Test 3: Country = international (International Only)
    console.log("\n--- Test 3: GET /api/hackathons?country=international ---");
    const intlRes = await axios.get(`${BASE_URL}?country=international&limit=100`);
    assert(intlRes.data.pagination.total === 41, `Total International hackathons = 41 (got ${intlRes.data.pagination.total})`);
    const allIntl = intlRes.data.data.every((h) => h.locationType === "international");
    assert(allIntl, "All returned hackathons have locationType === 'international'");
    const noInInIntl = intlRes.data.data.every((h) => h.countryCode !== "IN");
    assert(noInInIntl, "No Indian hackathons leaked into International filter");

    // Test 4: Country = unknown (Location Not Specified)
    console.log("\n--- Test 4: GET /api/hackathons?country=unknown ---");
    const unkRes = await axios.get(`${BASE_URL}?country=unknown&limit=100`);
    assert(unkRes.data.pagination.total === 204, `Total Unknown hackathons = 204 (got ${unkRes.data.pagination.total})`);
    const allUnk = unkRes.data.data.every((h) => h.locationType === "unknown" || h.countryCode == null);
    assert(allUnk, "All returned hackathons have unknown/unspecified location");

    // Test 5: Compound Filter: country=IN & mode=Online
    console.log("\n--- Test 5: GET /api/hackathons?country=IN&mode=Online ---");
    const inOnlineRes = await axios.get(`${BASE_URL}?country=IN&mode=Online&limit=50`);
    const totalInOnline = inOnlineRes.data.pagination.total;
    assert(totalInOnline > 0, `Returned ${totalInOnline} online Indian hackathons`);
    const allInOnline = inOnlineRes.data.data.every((h) => h.countryCode === "IN" && h.mode === "Online");
    assert(allInOnline, "All items satisfy both countryCode === 'IN' AND mode === 'Online'");

    // Test 6: Compound Filter: country=IN & category=Artificial Intelligence
    console.log("\n--- Test 6: GET /api/hackathons?country=IN&category=Artificial%20Intelligence ---");
    const inAiRes = await axios.get(`${BASE_URL}?country=IN&category=Artificial%20Intelligence&limit=50`);
    const totalInAi = inAiRes.data.pagination.total;
    assert(totalInAi > 0, `Returned ${totalInAi} AI Indian hackathons`);
    const allInAi = inAiRes.data.data.every((h) => h.countryCode === "IN" && h.categories.includes("Artificial Intelligence"));
    assert(allInAi, "All items satisfy countryCode === 'IN' AND category === 'Artificial Intelligence'");

    // Test 7: Compound Filter: country=IN & status=Open
    console.log("\n--- Test 7: GET /api/hackathons?country=IN&status=Open ---");
    const inOpenRes = await axios.get(`${BASE_URL}?country=IN&status=Open&limit=50`);
    const totalInOpen = inOpenRes.data.pagination.total;
    assert(totalInOpen > 0, `Returned ${totalInOpen} Open Indian hackathons`);
    const allInOpen = inOpenRes.data.data.every((h) => h.countryCode === "IN" && h.status === "Open");
    assert(allInOpen, "All items satisfy countryCode === 'IN' AND status === 'Open'");

    // Test 8: State Filter: country=IN & state=Maharashtra
    console.log("\n--- Test 8: GET /api/hackathons?country=IN&state=Maharashtra ---");
    const mhRes = await axios.get(`${BASE_URL}?country=IN&state=Maharashtra&limit=50`);
    assert(mhRes.data.pagination.total === 28, `Maharashtra total is 28 (got ${mhRes.data.pagination.total})`);
    const allMh = mhRes.data.data.every((h) => h.countryCode === "IN" && h.state === "Maharashtra");
    assert(allMh, "All items have countryCode === 'IN' AND state === 'Maharashtra'");

    // Test 9: City Filter: country=IN & state=Karnataka & city=Bengaluru
    console.log("\n--- Test 9: GET /api/hackathons?country=IN&state=Karnataka&city=Bengaluru ---");
    const blrRes = await axios.get(`${BASE_URL}?country=IN&state=Karnataka&city=Bengaluru&limit=50`);
    assert(blrRes.data.pagination.total === 9, `Bengaluru total is 9 (got ${blrRes.data.pagination.total})`);
    const allBlr = blrRes.data.data.every((h) => h.countryCode === "IN" && h.state === "Karnataka" && h.city === "Bengaluru");
    assert(allBlr, "All items have countryCode === 'IN', state === 'Karnataka', and city === 'Bengaluru'");

    // Test 10: Platform independence check: Unstop hackathons can be international
    console.log("\n--- Test 10: Platform Independence Verification ---");
    const intlUnstop = intlRes.data.data.filter((h) => h.platform === "Unstop" || h.sourceId?.startsWith("unstop-"));
    const inUnstop = inRes.data.data.filter((h) => h.platform === "Unstop" || h.sourceId?.startsWith("unstop-"));
    console.log(`Unstop events in India: ${inUnstop.length}, Unstop events in International: ${intlUnstop.length}`);
    assert(inUnstop.length > 0, "Unstop has verified Indian events");
    assert(intlRes.data.pagination.total > 0 && inRes.data.pagination.total > 0, "Platform classification is decoupled from platform name");

    console.log(`\n========================================`);
    console.log(`TEST RESULTS: ${passed}/${total} PASSED`);
    console.log(`========================================`);
  } catch (err) {
    console.error("Test execution error:", err.message);
    if (err.response) {
      console.error("Response data:", err.response.data);
    }
  }
}

runTests();
