const request = require("supertest");
const app = require("../server");
const nock = require("nock");
const { setupTestDB, teardownTestDB, clearTestDB } = require("./setupTestDB");

beforeAll(async () => await setupTestDB());
afterEach(async () => {
  nock.cleanAll();
  await clearTestDB();
});
afterAll(async () => await teardownTestDB());

test("POST /api/ai/generate-questions returns generated data (mock AI)", async () => {
  // If your controller calls external API, mock the HTTP endpoint
  nock("https://api.openai.com")
    .post("/v1/whatever")
    .reply(200, { choices: [{ text: "Q1\nQ2" }] });

  // Simulate an authenticated request or stub protect middleware if needed
  const payload = { topic: "nodejs" };
  const res = await request(app).post("/api/ai/generate-questions").send(payload);
  // adapt assertions based on your controller's actual response
  expect([200,201]).toContain(res.statusCode);
  expect(res.body).toBeDefined();
});
