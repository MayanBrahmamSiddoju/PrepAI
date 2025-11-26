const request = require("supertest");
const app = require("../server");

describe("Prometheus metrics endpoint", () => {
  test("GET /metrics returns prometheus text", async () => {
    const res = await request(app).get("/metrics");
    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toMatch(/text\/plain|text\/plain; charset=utf-8/);
    // metrics response contains HELP or my custom metric name
    expect(res.text).toMatch(/# HELP|http_requests_total|process_cpu_seconds_total/);
  });
});
