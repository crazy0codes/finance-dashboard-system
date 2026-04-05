import "dotenv/config";

const BASE_URL = "http://localhost:3000/api";
let adminToken = "";
let viewerToken = "";
let analystToken = "";
let createdUserId = "";
let createdRecordId = "";

let passed = 0;
let failed = 0;

async function request(method, path, body, token) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

function assert(testName, condition, details = "") {
  if (condition) {
    console.log(`  ✅ PASS — ${testName}`);
    passed++;
  } else {
    console.log(`  ❌ FAIL — ${testName} ${details}`);
    failed++;
  }
}

// ─────────────────────────────────────────────
// CLEANUP
// ─────────────────────────────────────────────
async function cleanup(token) {
  const users = await request("GET", "/users", null, token);
  const testUsers = users.data.users?.filter(u => u.email.endsWith("@test.com"));
  for (const u of testUsers || []) {
    await request("DELETE", `/users/${u.id}`, null, token);
  }
}

// ─────────────────────────────────────────────
// AUTH TESTS
// ─────────────────────────────────────────────
async function testAuth() {
  console.log("\n📦 AUTH");

  let r = await request("POST", "/auth/register", {
    email: "admin@test.com",
    password: "Admin1234",
    role: "ADMIN",
  });
  assert("Register admin user", r.status === 201, JSON.stringify(r.data));
  assert("No password in response", !r.data.user?.password);

  r = await request("POST", "/auth/register", {
    email: "viewer@test.com",
    password: "Viewer1234",
    role: "VIEWER",
  });
  assert("Register viewer user", r.status === 201, JSON.stringify(r.data));

  r = await request("POST", "/auth/register", {
    email: "analyst@test.com",
    password: "Analyst1234",
    role: "ANALYST",
  });
  assert("Register analyst user", r.status === 201, JSON.stringify(r.data));
  createdUserId = r.data.user?.id;

  // Duplicate email
  r = await request("POST", "/auth/register", { email: "admin@test.com", password: "Admin1234" });
  assert("Duplicate email returns 409", r.status === 409, JSON.stringify(r.data));

  // Missing password
  r = await request("POST", "/auth/register", { email: "nopw@test.com" });
  assert("Missing password returns 400", r.status === 400, JSON.stringify(r.data));

  // Login
  r = await request("POST", "/auth/login", { email: "admin@test.com", password: "Admin1234" });
  assert("Login admin returns token", r.status === 200 && !!r.data.token, JSON.stringify(r.data));
  adminToken = r.data.token;

  r = await request("POST", "/auth/login", { email: "viewer@test.com", password: "Viewer1234" });
  assert("Login viewer returns token", r.status === 200 && !!r.data.token, JSON.stringify(r.data));
  viewerToken = r.data.token;

  r = await request("POST", "/auth/login", { email: "analyst@test.com", password: "Analyst1234" });
  assert("Login analyst returns token", r.status === 200 && !!r.data.token, JSON.stringify(r.data));
  analystToken = r.data.token;

  // Wrong password
  r = await request("POST", "/auth/login", { email: "admin@test.com", password: "wrongpassword" });
  assert("Wrong password returns 401", r.status === 401, JSON.stringify(r.data));

  // Non-existent user
  r = await request("POST", "/auth/login", { email: "nobody@test.com", password: "whatever" });
  assert("Non-existent user returns 401 or 404", r.status === 401 || r.status === 404, JSON.stringify(r.data));
}

// ─────────────────────────────────────────────
// AUTH VALIDATION TESTS
// ─────────────────────────────────────────────
async function testAuthValidation() {
  console.log("\n🔍 AUTH VALIDATION");

  // Invalid email format
  let r = await request("POST", "/auth/register", { email: "notanemail", password: "Admin1234" });
  assert("Invalid email format returns 400", r.status === 400, JSON.stringify(r.data));

  // Password too short
  r = await request("POST", "/auth/register", { email: "test@test.com", password: "abc" });
  assert("Password too short returns 400", r.status === 400, JSON.stringify(r.data));

  // Empty email
  r = await request("POST", "/auth/register", { email: "", password: "Admin1234" });
  assert("Empty email returns 400", r.status === 400, JSON.stringify(r.data));

  // Missing email
  r = await request("POST", "/auth/register", { password: "Admin1234" });
  assert("Missing email returns 400", r.status === 400, JSON.stringify(r.data));

  // Login missing email
  r = await request("POST", "/auth/login", { password: "Admin1234" });
  assert("Login missing email returns 400", r.status === 400, JSON.stringify(r.data));

  // Login missing password
  r = await request("POST", "/auth/login", { email: "admin@test.com" });
  assert("Login missing password returns 400", r.status === 400, JSON.stringify(r.data));
}

// ─────────────────────────────────────────────
// USER TESTS
// ─────────────────────────────────────────────
async function testUsers() {
  console.log("\n👥 USERS");

  let r = await request("GET", "/users");
  assert("GET /users without token returns 401", r.status === 401, JSON.stringify(r.data));

  r = await request("GET", "/users", null, viewerToken);
  assert("Viewer cannot GET /users (403)", r.status === 403, JSON.stringify(r.data));

  r = await request("GET", "/users", null, adminToken);
  assert("Admin can GET /users", r.status === 200 && Array.isArray(r.data.users), JSON.stringify(r.data));
  assert("No passwords in user list", r.data.users?.every(u => !u.password));

  r = await request("PATCH", `/users/${createdUserId}/role`, { role: "ANALYST" }, adminToken);
  assert("Admin can update user role", r.status === 200, JSON.stringify(r.data));

  r = await request("PATCH", `/users/${createdUserId}/status`, { status: "INACTIVE" }, adminToken);
  assert("Admin can update user status", r.status === 200, JSON.stringify(r.data));

  r = await request("PATCH", `/users/${createdUserId}/role`, { role: "ADMIN" }, viewerToken);
  assert("Viewer cannot update role (403)", r.status === 403, JSON.stringify(r.data));

  r = await request("PATCH", "/users/99999/role", { role: "ADMIN" }, adminToken);
  assert("Update non-existent user returns 404", r.status === 404, JSON.stringify(r.data));
}

// ─────────────────────────────────────────────
// RECORD TESTS
// ─────────────────────────────────────────────
async function testRecords() {
  console.log("\n💰 RECORDS");

  let r = await request("POST", "/records", {
    amount: 5000, type: "INCOME", category: "FOOD",
    date: new Date().toISOString(), notes: "Test income",
  }, adminToken);
  assert("Admin can create record", r.status === 201, JSON.stringify(r.data));
  createdRecordId = r.data.record?.id;

  r = await request("POST", "/records", {
    amount: 1500, type: "EXPENSE", category: "TRAVEL",
    date: new Date().toISOString(), notes: "Test expense",
  }, adminToken);
  assert("Admin can create expense record", r.status === 201, JSON.stringify(r.data));

  r = await request("POST", "/records", {
    amount: 100, type: "INCOME", category: "OTHER", date: new Date().toISOString(),
  }, viewerToken);
  assert("Viewer cannot create record (403)", r.status === 403, JSON.stringify(r.data));

  r = await request("POST", "/records", { amount: 100 });
  assert("No token cannot create record (401)", r.status === 401, JSON.stringify(r.data));

  r = await request("GET", "/records", null, viewerToken);
  assert("Viewer can GET /records", r.status === 200 && Array.isArray(r.data.records), JSON.stringify(r.data));

  r = await request("GET", "/records?type=INCOME", null, adminToken);
  assert("Filter records by type", r.status === 200, JSON.stringify(r.data));

  r = await request("GET", "/records?category=FOOD", null, adminToken);
  assert("Filter records by category", r.status === 200, JSON.stringify(r.data));

  r = await request("PATCH", `/records/${createdRecordId}`, { notes: "Updated note" }, adminToken);
  assert("Admin can update record", r.status === 200, JSON.stringify(r.data));

  r = await request("PATCH", `/records/${createdRecordId}`, { notes: "Hack" }, viewerToken);
  assert("Viewer cannot update record (403)", r.status === 403, JSON.stringify(r.data));

  r = await request("PATCH", "/records/99999", { notes: "ghost" }, adminToken);
  assert("Update non-existent record returns 404", r.status === 404, JSON.stringify(r.data));

  r = await request("DELETE", `/records/${createdRecordId}`, null, adminToken);
  assert("Admin can delete record", r.status === 200, JSON.stringify(r.data));

  r = await request("GET", "/records", null, adminToken);
  const found = r.data.records?.find(rec => rec.id === createdRecordId);
  assert("Deleted record not in list", !found);

  r = await request("DELETE", `/records/${createdRecordId}`, null, adminToken);
  assert("Delete already deleted record returns 404", r.status === 404, JSON.stringify(r.data));

  r = await request("DELETE", `/records/${createdRecordId}`, null, viewerToken);
  assert("Viewer cannot delete record (403)", r.status === 403, JSON.stringify(r.data));
}

// ─────────────────────────────────────────────
// RECORD VALIDATION TESTS
// ─────────────────────────────────────────────
async function testRecordValidation() {
  console.log("\n🔍 RECORD VALIDATION");

  // Negative amount
  let r = await request("POST", "/records", {
    amount: -100, type: "INCOME", category: "FOOD", date: new Date().toISOString(),
  }, adminToken);
  assert("Negative amount returns 400", r.status === 400, JSON.stringify(r.data));

  // Zero amount
  r = await request("POST", "/records", {
    amount: 0, type: "INCOME", category: "FOOD", date: new Date().toISOString(),
  }, adminToken);
  assert("Zero amount returns 400", r.status === 400, JSON.stringify(r.data));

  // Invalid type
  r = await request("POST", "/records", {
    amount: 100, type: "INVALID", category: "FOOD", date: new Date().toISOString(),
  }, adminToken);
  assert("Invalid type returns 400", r.status === 400, JSON.stringify(r.data));

  // Invalid category
  r = await request("POST", "/records", {
    amount: 100, type: "INCOME", category: "HACKING", date: new Date().toISOString(),
  }, adminToken);
  assert("Invalid category returns 400", r.status === 400, JSON.stringify(r.data));

  // Invalid date
  r = await request("POST", "/records", {
    amount: 100, type: "INCOME", category: "FOOD", date: "notadate",
  }, adminToken);
  assert("Invalid date returns 400", r.status === 400, JSON.stringify(r.data));

  // Missing amount
  r = await request("POST", "/records", {
    type: "INCOME", category: "FOOD", date: new Date().toISOString(),
  }, adminToken);
  assert("Missing amount returns 400", r.status === 400, JSON.stringify(r.data));

  // Invalid filter type
  r = await request("GET", "/records?type=WRONG", null, adminToken);
  assert("Invalid filter type returns 400", r.status === 400, JSON.stringify(r.data));

  // Invalid filter category
  r = await request("GET", "/records?category=WRONG", null, adminToken);
  assert("Invalid filter category returns 400", r.status === 400, JSON.stringify(r.data));

  // startDate after endDate
  r = await request("GET", "/records?startDate=2025-12-01&endDate=2025-01-01", null, adminToken);
  assert("startDate after endDate returns 400", r.status === 400, JSON.stringify(r.data));
}

// ─────────────────────────────────────────────
// DASHBOARD TESTS
// ─────────────────────────────────────────────
async function testDashboard() {
  console.log("\n📊 DASHBOARD");

  let r = await request("GET", "/dashboard/summary", null, adminToken);
  assert("Admin can GET summary", r.status === 200 && r.data.summary, JSON.stringify(r.data));
  assert("Summary has totalIncome", r.data.summary?.totalIncome !== undefined);
  assert("Summary has totalExpense", r.data.summary?.totalExpense !== undefined);
  assert("Summary has netBalance", r.data.summary?.netBalance !== undefined);

  r = await request("GET", "/dashboard/summary", null, viewerToken);
  assert("Viewer cannot GET summary (403)", r.status === 403, JSON.stringify(r.data));

  r = await request("GET", "/dashboard/summary");
  assert("No token cannot GET summary (401)", r.status === 401, JSON.stringify(r.data));

  r = await request("GET", "/dashboard/categories", null, analystToken);
  assert("Analyst can GET category totals", r.status === 200 && Array.isArray(r.data.totals), JSON.stringify(r.data));

  r = await request("GET", "/dashboard/recent", null, analystToken);
  assert("Analyst can GET recent activity", r.status === 200 && Array.isArray(r.data.activity), JSON.stringify(r.data));

  r = await request("GET", "/dashboard/trends", null, adminToken);
  assert("Admin can GET monthly trends", r.status === 200 && Array.isArray(r.data.trends), JSON.stringify(r.data));
}

// ─────────────────────────────────────────────
// RUN ALL
// ─────────────────────────────────────────────
async function run() {
  console.log("🚀 Running API Tests...");

  try {
    // register temp admin for pre-cleanup
    await request("POST", "/auth/register", { email: "admin@test.com", password: "Admin1234", role: "ADMIN" });
    const tempLogin = await request("POST", "/auth/login", { email: "admin@test.com", password: "Admin1234" });
    const tempToken = tempLogin.data.token;
    console.log("\n🧹 PRE-CLEANUP");
    await cleanup(tempToken);
    console.log("  Done");

    await testAuth();
    await testAuthValidation();
    await testUsers();
    await testRecords();
    await testRecordValidation();
    await testDashboard();

    console.log("\n🧹 POST-CLEANUP");
    await cleanup(adminToken);
    console.log("  Done");

  } catch (err) {
    console.error("\n💥 Test runner crashed:", err.message);
  }

  console.log(`\n─────────────────────────────`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Total:  ${passed + failed}`);
  console.log(`─────────────────────────────\n`);
}

run();