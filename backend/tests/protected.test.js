const request = require("supertest");
const app = require("../server");
const { setupTestDB, teardownTestDB, clearTestDB } = require("./setupTestDB");

beforeAll(async () => await setupTestDB());
afterEach(async () => await clearTestDB());
afterAll(async () => await teardownTestDB());

test("Protected route requires auth", async () => {
  const res = await request(app).get("/api/sessions/protected-route"); // replace with an actual protected route
  expect(res.statusCode).toBe(401);
});
