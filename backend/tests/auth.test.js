const request = require("supertest");
const app = require("../server");
const { setupTestDB, teardownTestDB, clearTestDB } = require("./setupTestDB");

beforeAll(async () => {
  await setupTestDB();
});
afterEach(async () => {
  await clearTestDB();
});
afterAll(async () => {
  await teardownTestDB();
});

describe("Auth routes", () => {
  test("POST /api/auth/register creates user", async () => {
    const payload = { name: "Test", email: "t@t.com", password: "password123" };
    const res = await request(app).post("/api/auth/register").send(payload);
    expect(res.statusCode).toBe(201); // depends on your controller
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toHaveProperty("email", "t@t.com");
  });

  test("POST /api/auth/login with wrong credentials returns 401", async () => {
    await request(app).post("/api/auth/register").send({ name:"a", email:"b@c.com", password:"pwd" });
    const res = await request(app).post("/api/auth/login").send({ email: "b@c.com", password: "wrong" });
    expect(res.statusCode).toBe(401);
  });
});
