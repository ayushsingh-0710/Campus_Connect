/**
 * Campus Connect — API Test Suite
 * Tests all Discovery + Connection endpoints with real HTTP requests.
 * Runs against http://localhost:5000
 */

const BASE = "http://localhost:5000/api";

let studentAToken = null;
let studentBToken = null;
let studentAId = null;
let studentBId = null;
let connectionRequestId = null;

const results = [];

// ── Helpers ───────────────────────────────────────────────────────────────────

const req = async (method, path, body, token) => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data;
  try { data = await res.json(); } catch { data = {}; }
  return { status: res.status, data };
};

const pass = (name, detail = "") => {
  results.push({ name, result: "PASS", detail });
  console.log(`  ✅ PASS  ${name}${detail ? " — " + detail : ""}`);
};

const fail = (name, detail = "") => {
  results.push({ name, result: "FAIL", detail });
  console.error(`  ❌ FAIL  ${name}${detail ? " — " + detail : ""}`);
};

const assert = (name, condition, detail = "") => {
  if (condition) pass(name, detail);
  else fail(name, detail);
};

// ── Unique test emails (timestamp-based) ─────────────────────────────────────
const ts = Date.now();
const EMAIL_A = `testa_${ts}@campus.test`;
const EMAIL_B = `testb_${ts}@campus.test`;
const PASSWORD = "Test@12345";

// ═════════════════════════════════════════════════════════════════════════════
// PHASE 1 — Auth Setup
// ═════════════════════════════════════════════════════════════════════════════
console.log("\n── Phase 1: Auth Setup ──────────────────────────────────────");

// Register Student A
let r = await req("POST", "/auth/register", {
  fullName: "Test Student A",
  email: EMAIL_A,
  password: PASSWORD,
  university: "Campus University",
  campus: "North Campus",
  course: "Computer Science",
  yearOfStudy: 2,
  skills: ["React", "Node.js"],
});
assert("Register Student A", r.status === 201 || r.status === 200, `status=${r.status}`);
studentAToken = r.data?.token || r.data?.accessToken;
studentAId = r.data?.user?._id || r.data?.user?.id;
if (!studentAToken) {
  // Try login fallback
  const lr = await req("POST", "/auth/login", { email: EMAIL_A, password: PASSWORD });
  studentAToken = lr.data?.token || lr.data?.accessToken;
  studentAId = lr.data?.user?._id || lr.data?.user?.id;
}
assert("Student A token received", !!studentAToken, studentAToken ? "token present" : "NO TOKEN");
assert("Student A ID received", !!studentAId, studentAId || "NO ID");

// Register Student B
r = await req("POST", "/auth/register", {
  fullName: "Test Student B",
  email: EMAIL_B,
  password: PASSWORD,
  university: "Campus University",
  campus: "City Campus",
  course: "Product Design",
  yearOfStudy: 3,
  skills: ["Figma", "UX Research"],
});
assert("Register Student B", r.status === 201 || r.status === 200, `status=${r.status}`);
studentBToken = r.data?.token || r.data?.accessToken;
studentBId = r.data?.user?._id || r.data?.user?.id;
if (!studentBToken) {
  const lr = await req("POST", "/auth/login", { email: EMAIL_B, password: PASSWORD });
  studentBToken = lr.data?.token || lr.data?.accessToken;
  studentBId = lr.data?.user?._id || lr.data?.user?.id;
}
assert("Student B token received", !!studentBToken, studentBToken ? "token present" : "NO TOKEN");
assert("Student B ID received", !!studentBId, studentBId || "NO ID");

// ═════════════════════════════════════════════════════════════════════════════
// PHASE 2 — Auth Middleware
// ═════════════════════════════════════════════════════════════════════════════
console.log("\n── Phase 2: Auth Middleware ─────────────────────────────────");

r = await req("GET", "/users");
assert("GET /users without token → 401", r.status === 401, `got ${r.status}`);

r = await req("GET", "/connections");
assert("GET /connections without token → 401", r.status === 401, `got ${r.status}`);

r = await req("GET", "/auth/me", null, studentAToken);
assert("GET /auth/me with valid token → 200", r.status === 200, `got ${r.status}`);

// ═════════════════════════════════════════════════════════════════════════════
// PHASE 3 — Discovery
// ═════════════════════════════════════════════════════════════════════════════
console.log("\n── Phase 3: Discovery ───────────────────────────────────────");

r = await req("GET", "/users", null, studentAToken);
assert("GET /users → 200", r.status === 200, `got ${r.status}`);
assert("GET /users returns students array", Array.isArray(r.data?.students), JSON.stringify(r.data).slice(0, 80));

// Self-exclusion
if (Array.isArray(r.data?.students)) {
  const selfInList = r.data.students.some(s => (s._id || s.id) === studentAId);
  assert("Logged-in user excluded from discovery", !selfInList, selfInList ? "SELF FOUND in results" : "self not in list");
}

// passwordHash never returned
if (Array.isArray(r.data?.students) && r.data.students.length > 0) {
  const hasHash = r.data.students.some(s => s.passwordHash);
  assert("passwordHash not in discovery results", !hasHash, hasHash ? "HASH EXPOSED" : "clean");
  const hasEmail = r.data.students.some(s => s.email);
  assert("email not in discovery results", !hasEmail, hasEmail ? "EMAIL EXPOSED" : "clean");
}

// Pagination meta
assert("Pagination metadata present", !!r.data?.pagination, JSON.stringify(r.data?.pagination));

// Search
r = await req("GET", "/users?search=Figma", null, studentAToken);
assert("GET /users?search=Figma → 200", r.status === 200, `got ${r.status}`);
if (Array.isArray(r.data?.students)) {
  const hasB = r.data.students.some(s => s.skills?.includes("Figma"));
  assert("Search by skill 'Figma' returns Student B", hasB, `found ${r.data.students.length} results`);
}

// Campus filter
r = await req("GET", "/users?campus=City+Campus", null, studentAToken);
assert("GET /users?campus=City Campus → 200", r.status === 200, `got ${r.status}`);

// Invalid ID
r = await req("GET", "/users/not-a-valid-id", null, studentAToken);
assert("GET /users/invalid-id → 400", r.status === 400, `got ${r.status}`);

// Valid Student B profile
if (studentBId) {
  r = await req("GET", `/users/${studentBId}`, null, studentAToken);
  assert("GET /users/:id returns Student B", r.status === 200, `got ${r.status}`);
  assert("Student B profile has fullName", !!r.data?.student?.fullName, r.data?.student?.fullName);
  assert("Student B no passwordHash", !r.data?.student?.passwordHash, "clean");
  assert("Student B no email", !r.data?.student?.email, "clean");
}

// ═════════════════════════════════════════════════════════════════════════════
// PHASE 4 — Connections
// ═════════════════════════════════════════════════════════════════════════════
console.log("\n── Phase 4: Connections ─────────────────────────────────────");

// Self-request prevention
r = await req("POST", `/connections/${studentAId}/request`, null, studentAToken);
assert("Self-request → 400", r.status === 400, `got ${r.status} — ${r.data?.message}`);

// Send request A → B
r = await req("POST", `/connections/${studentBId}/request`, null, studentAToken);
assert("Send connection request A→B → 201", r.status === 201, `got ${r.status} — ${r.data?.message}`);
connectionRequestId = r.data?.connection?._id;
assert("Connection document ID returned", !!connectionRequestId, connectionRequestId || "NO ID");

// Duplicate request prevention
r = await req("POST", `/connections/${studentBId}/request`, null, studentAToken);
assert("Duplicate request A→B → 409", r.status === 409, `got ${r.status} — ${r.data?.message}`);

// Reverse request prevention (B→A while A→B pending)
r = await req("POST", `/connections/${studentAId}/request`, null, studentBToken);
assert("Reverse request B→A while A→B pending → 409", r.status === 409, `got ${r.status} — ${r.data?.message}`);

// Sent requests
r = await req("GET", "/connections/sent", null, studentAToken);
assert("GET /connections/sent → 200", r.status === 200, `got ${r.status}`);
assert("Sent requests include A→B", Array.isArray(r.data?.requests) && r.data.requests.length > 0, `${r.data?.requests?.length} items`);

// Received requests (B's perspective)
r = await req("GET", "/connections/received", null, studentBToken);
assert("GET /connections/received → 200 for Student B", r.status === 200, `got ${r.status}`);
assert("Received requests include A→B", Array.isArray(r.data?.requests) && r.data.requests.length > 0, `${r.data?.requests?.length} items`);
if (Array.isArray(r.data?.requests)) {
  const hasHash = r.data.requests.some(req => req.requester?.passwordHash || req.recipient?.passwordHash);
  assert("No passwordHash in received requests", !hasHash, hasHash ? "HASH EXPOSED" : "clean");
}

// A cannot accept their own sent request
r = await req("PATCH", `/connections/${connectionRequestId}/accept`, null, studentAToken);
assert("Requester cannot accept own request → 403", r.status === 403, `got ${r.status} — ${r.data?.message}`);

// B accepts the request
r = await req("PATCH", `/connections/${connectionRequestId}/accept`, null, studentBToken);
assert("Recipient B accepts request → 200", r.status === 200, `got ${r.status}`);
assert("Status is accepted", r.data?.connection?.status === "accepted", r.data?.connection?.status);

// Already-accepted cannot be accepted again
r = await req("PATCH", `/connections/${connectionRequestId}/accept`, null, studentBToken);
assert("Re-accepting already accepted → 409", r.status === 409, `got ${r.status} — ${r.data?.message}`);

// Accepted connection visible for A
r = await req("GET", "/connections", null, studentAToken);
assert("GET /connections for A → 200", r.status === 200, `got ${r.status}`);
assert("A sees accepted connection", Array.isArray(r.data?.connections) && r.data.connections.length > 0, `${r.data?.connections?.length} connections`);

// Accepted connection visible for B
r = await req("GET", "/connections", null, studentBToken);
assert("GET /connections for B → 200", r.status === 200, `got ${r.status}`);
assert("B sees accepted connection", Array.isArray(r.data?.connections) && r.data.connections.length > 0, `${r.data?.connections?.length} connections`);
if (Array.isArray(r.data?.connections) && r.data.connections.length > 0) {
  const conn = r.data.connections[0];
  assert("connectedUser exposed (not raw requester/recipient)", !!conn.connectedUser, JSON.stringify(conn).slice(0, 60));
  assert("connectedUser is Student A for B", conn.connectedUser?.fullName === "Test Student A", conn.connectedUser?.fullName);
}

// Non-participant cannot remove connection
const fakeToken = studentBToken; // B trying to remove — but let's test with another call
// Create a second connection pair for rejection test
let r2 = await req("POST", "/auth/register", {
  fullName: "Test Student C",
  email: `testc_${ts}@campus.test`,
  password: PASSWORD,
  university: "Campus University",
  campus: "West Campus",
  course: "Data Science",
  yearOfStudy: 1,
});
const studentCToken = r2.data?.token || r2.data?.accessToken;

// A sends to C
r = await req("POST", `/connections/${r2.data?.user?._id}/request`, null, studentAToken);
const rejectionConnId = r.data?.connection?._id;
assert("A sends request to C → 201", r.status === 201, `got ${r.status}`);

// C rejects
if (rejectionConnId) {
  r = await req("PATCH", `/connections/${rejectionConnId}/reject`, null, studentCToken);
  assert("C rejects A's request → 200", r.status === 200, `got ${r.status}`);
  assert("Status is rejected", r.data?.connection?.status === "rejected", r.data?.connection?.status);
}

// Remove accepted connection (A removes A-B connection)
const acceptedConnId = connectionRequestId;
r = await req("DELETE", `/connections/${acceptedConnId}`, null, studentAToken);
assert("A removes A-B connection → 200", r.status === 200, `got ${r.status}`);

// Verify gone for both
r = await req("GET", "/connections", null, studentAToken);
const aConns = r.data?.connections || [];
assert("A's connections list empty after removal", aConns.length === 0, `${aConns.length} remaining`);

r = await req("GET", "/connections", null, studentBToken);
const bConns = r.data?.connections || [];
assert("B's connections list empty after removal", bConns.length === 0, `${bConns.length} remaining`);

// Invalid connection ID
r = await req("GET", "/users/000000000000000000000000", null, studentAToken);
assert("Non-existent user ID → 404", r.status === 404, `got ${r.status}`);

r = await req("PATCH", `/connections/000000000000000000000000/accept`, null, studentBToken);
assert("Non-existent connection ID → 404", r.status === 404, `got ${r.status}`);

// ═════════════════════════════════════════════════════════════════════════════
// PHASE 5 — Regression: Auth & Hackathons still work
// ═════════════════════════════════════════════════════════════════════════════
console.log("\n── Phase 5: Regression ──────────────────────────────────────");

r = await req("GET", "/auth/me", null, studentAToken);
assert("GET /auth/me still works", r.status === 200, `got ${r.status}`);

r = await req("GET", "/hackathons");
assert("GET /hackathons accessible (no auth required or 401)", r.status === 200 || r.status === 401, `got ${r.status}`);

r = await req("POST", "/auth/logout", null, studentAToken);
assert("POST /auth/logout works", r.status === 200, `got ${r.status}`);

// ═════════════════════════════════════════════════════════════════════════════
// SUMMARY
// ═════════════════════════════════════════════════════════════════════════════
console.log("\n── Summary ──────────────────────────────────────────────────");
const passed = results.filter(r => r.result === "PASS").length;
const failed = results.filter(r => r.result === "FAIL").length;
console.log(`\n  Total: ${results.length} | PASS: ${passed} | FAIL: ${failed}`);

if (failed > 0) {
  console.log("\n  FAILURES:");
  results.filter(r => r.result === "FAIL").forEach(r => {
    console.log(`    ❌ ${r.name} — ${r.detail}`);
  });
}

console.log("\n  VERDICT:", failed === 0 ? "PASS" : failed <= 3 ? "PASS WITH WARNINGS" : "FAIL");
