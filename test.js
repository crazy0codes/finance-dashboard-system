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
// AUTH TESTS
// ─────────────────────────────────────────────
async function testAuth() {
  console.log("\n📦 AUTH");

  // Register admin
  let r = await request("POST", "/auth/register", {
    email: "admin@test.com",
    password: "Admin1234",
    role: "ADMIN",
  });
  assert("Register admin user", r.status === 201, JSON.stringify(r.data));
  assert("No password in response", !r.data.user?.password);

  // Register viewer
  r = await request("POST", "/auth/register", {
    email: "viewer@test.com",
    password: "Viewer1234",
    role: "VIEWER",
  });
  assert("Register viewer user", r.status === 201, JSON.stringify(r.data));

  // Register analyst
  r = await request("POST", "/auth/register", {
    email: "analyst@test.com",
    password: "Analyst1234",
    role: "ANALYST",
  });
  assert("Register analyst user", r.status === 201, JSON.stringify(r.data));
  createdUserId = r.data.user?.id;

  // Duplicate email
  r = await request("POST", "/auth/register", {
    email: "admin@test.com",
    password: "Admin1234",
  });
  assert("Duplicate email returns 409", r.status === 409, JSON.stringify(r.data));

  // Missing fields
  r = await request("POST", "/auth/register", { email: "nopw@test.com" });
  assert("Missing password returns 400", r.status === 400, JSON.stringify(r.data));

  // Login admin
  r = await request("POST", "/auth/login", {
    email: "admin@test.com",
    password: "Admin1234",
  });
  assert("Login admin returns token", r.status === 200 && !!r.data.token, JSON.stringify(r.data));
  adminToken = r.data.token;

  // Login viewer
  r = await request("POST", "/auth/login", {
    email: "viewer@test.com",
    password: "Viewer1234",
  });
  assert("Login viewer returns token", r.status === 200 && !!r.data.token, JSON.stringify(r.data));
  viewerToken = r.data.token;

  // Login analyst
  r = await request("POST", "/auth/login", {
    email: "analyst@test.com",
    password: "Analyst1234",
  });
  assert("Login analyst returns token", r.status === 200 && !!r.data.token, JSON.stringify(r.data));
  analystToken = r.data.token;

  // Wrong password
  r = await request("POST", "/auth/login", {
    email: "admin@test.com",
    password: "wrongpassword",
  });
  assert("Wrong password returns 401", r.status === 401, JSON.stringify(r.data));

  // Non-existent user
  r = await request("POST", "/auth/login", {
    email: "nobody@test.com",
    password: "whatever",
  });
  assert("Non-existent user returns 401 or 404", r.status === 401 || r.status === 404, JSON.stringify(r.data));
}

// ─────────────────────────────────────────────
// USER TESTS
// ─────────────────────────────────────────────
async function testUsers() {
  console.log("\n👥 USERS");

  // No token
  let r = await request("GET", "/users");
  assert("GET /users without token returns 401", r.status === 401, JSON.stringify(r.data));

  // Viewer cannot access users
  r = await request("GET", "/users", null, viewerToken);
  assert("Viewer cannot GET /users (403)", r.status === 403, JSON.stringify(r.data));

  // Admin can get all users
  r = await request("GET", "/users", null, adminToken);
  assert("Admin can GET /users", r.status === 200 && Array.isArray(r.data.users), JSON.stringify(r.data));
  assert("No passwords in user list", r.data.users?.every(u => !u.password));

  // Update role
  r = await request("PATCH", `/users/${createdUserId}/role`, { role: "ANALYST" }, adminToken);
  assert("Admin can update user role", r.status === 200, JSON.stringify(r.data));

  // Update status
  r = await request("PATCH", `/users/${createdUserId}/status`, { status: "INACTIVE" }, adminToken);
  assert("Admin can update user status", r.status === 200, JSON.stringify(r.data));

  // Viewer cannot update role
  r = await request("PATCH", `/users/${createdUserId}/role`, { role: "ADMIN" }, viewerToken);
  assert("Viewer cannot update role (403)", r.status === 403, JSON.stringify(r.data));

  // Non-existent user
  r = await request("PATCH", "/users/99999/role", { role: "ADMIN" }, adminToken);
  assert("Update non-existent user returns 404", r.status === 404, JSON.stringify(r.data));
}

// ─────────────────────────────────────────────
// RECORD TESTS
// ─────────────────────────────────────────────
async function testRecords() {
  console.log("\n💰 RECORDS");

  // Create record as admin
  let r = await request("POST", "/records", {
    amount: 5000,
    type: "INCOME",
    category: "FOOD",
    date: new Date().toISOString(),
    notes: "Test income",
  }, adminToken);
  assert("Admin can create record", r.status === 201, JSON.stringify(r.data));
  createdRecordId = r.data.record?.id;

  // Create another record
  r = await request("POST", "/records", {
    amount: 1500,
    type: "EXPENSE",
    category: "TRAVEL",
    date: new Date().toISOString(),
    notes: "Test expense",
  }, adminToken);
  assert("Admin can create expense record", r.status === 201, JSON.stringify(r.data));

  // Viewer cannot create
  r = await request("POST", "/records", {
    amount: 100,
    type: "INCOME",
    category: "OTHER",
    date: new Date().toISOString(),
  }, viewerToken);
  assert("Viewer cannot create record (403)", r.status === 403, JSON.stringify(r.data));

  // No token cannot create
  r = await request("POST", "/records", { amount: 100 });
  assert("No token cannot create record (401)", r.status === 401, JSON.stringify(r.data));

  // Viewer can read records
  r = await request("GET", "/records", null, viewerToken);
  assert("Viewer can GET /records", r.status === 200 && Array.isArray(r.data.records), JSON.stringify(r.data));

  // Filter by type
  r = await request("GET", "/records?type=INCOME", null, adminToken);
  assert("Filter records by type", r.status === 200, JSON.stringify(r.data));

  // Filter by category
  r = await request("GET", "/records?category=FOOD", null, adminToken);
  assert("Filter records by category", r.status === 200, JSON.stringify(r.data));

  // Update record
  r = await request("PATCH", `/records/${createdRecordId}`, { notes: "Updated note" }, adminToken);
  assert("Admin can update record", r.status === 200, JSON.stringify(r.data));

  // Viewer cannot update
  r = await request("PATCH", `/records/${createdRecordId}`, { notes: "Hack" }, viewerToken);
  assert("Viewer cannot update record (403)", r.status === 403, JSON.stringify(r.data));

  // Update non-existent record
  r = await request("PATCH", "/records/99999", { notes: "ghost" }, adminToken);
  assert("Update non-existent record returns 404", r.status === 404, JSON.stringify(r.data));

  // Soft delete
  r = await request("DELETE", `/records/${createdRecordId}`, null, adminToken);
  assert("Admin can delete record", r.status === 200, JSON.stringify(r.data));

  // Deleted record should not appear in list
  r = await request("GET", "/records", null, adminToken);
  const found = r.data.records?.find(rec => rec.id === createdRecordId);
  assert("Deleted record not in list", !found);

  // Delete again (should 404)
  r = await request("DELETE", `/records/${createdRecordId}`, null, adminToken);
  assert("Delete already deleted record returns 404", r.status === 404, JSON.stringify(r.data));

  // Viewer cannot delete
  r = await request("DELETE", `/records/${createdRecordId}`, null, viewerToken);
  assert("Viewer cannot delete record (403)", r.status === 403, JSON.stringify(r.data));
}

// ─────────────────────────────────────────────
// DASHBOARD TESTS
// ─────────────────────────────────────────────
async function testDashboard() {
  console.log("\n📊 DASHBOARD");

  // Summary
  let r = await request("GET", "/dashboard/summary", null, adminToken);
  assert("Admin can GET summary", r.status === 200 && r.data.summary, JSON.stringify(r.data));
  assert("Summary has totalIncome", r.data.summary?.totalIncome !== undefined);
  assert("Summary has totalExpense", r.data.summary?.totalExpense !== undefined);
  assert("Summary has netBalance", r.data.summary?.netBalance !== undefined);

  // Viewer cannot access summary
  r = await request("GET", "/dashboard/summary", null, viewerToken);
  assert("Viewer cannot GET summary (403)", r.status === 403, JSON.stringify(r.data));

  // No token
  r = await request("GET", "/dashboard/summary");
  assert("No token cannot GET summary (401)", r.status === 401, JSON.stringify(r.data));

  // Category totals
  r = await request("GET", "/dashboard/categories", null, analystToken);
  assert("Analyst can GET category totals", r.status === 200 && Array.isArray(r.data.totals), JSON.stringify(r.data));

  // Recent activity
  r = await request("GET", "/dashboard/recent", null, analystToken);
  assert("Analyst can GET recent activity", r.status === 200 && Array.isArray(r.data.activity), JSON.stringify(r.data));

  // Monthly trends
  r = await request("GET", "/dashboard/trends", null, adminToken);
  assert("Admin can GET monthly trends", r.status === 200 && Array.isArray(r.data.trends), JSON.stringify(r.data));
}

// ─────────────────────────────────────────────
// CLEANUP — delete test users
// ─────────────────────────────────────────────
async function cleanup() {
  console.log("\n🧹 CLEANUP");
  const users = await request("GET", "/users", null, adminToken);
  const testUsers = users.data.users?.filter(u =>
    u.email.endsWith("@test.com")
  );
  for (const u of testUsers || []) {
    await request("DELETE", `/users/${u.id}`, null, adminToken);
  }
  console.log("  Cleaned up test users");
}

// ─────────────────────────────────────────────
// RUN ALL
// ─────────────────────────────────────────────
async function run() {
  console.log("🚀 Running API Tests...");
  await cleanup()
  try {
    await testAuth();
    await testUsers();
    await testRecords();
    await testDashboard();
    await cleanup();
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