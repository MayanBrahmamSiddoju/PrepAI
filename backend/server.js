require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const promClient = require("prom-client");

const authRoutes = require('./routes/authRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const questionRoutes = require('./routes/questionRoutes');
const { protect } = require("./middlewares/authMiddleware");
const { generateInterviewQuestions, generateConceptExplanation } = require("./controllers/aiController");

const app = express();

// Prometheus metrics setup
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: "http_request_duration_ms",
  help: "Duration of HTTP requests in ms",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

const httpRequestTotal = new promClient.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

// CORS middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Metrics endpoint (await the metrics Promise and handle errors)
app.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", register.contentType);
    const metrics = await register.metrics(); // IMPORTANT: await the Promise
    res.send(metrics); // express will set Content-Length and end the response
  } catch (err) {
    console.error("Failed to collect metrics:", err);
    res.status(500).send("Error collecting metrics");
  }
});

// Prometheus middleware
app.use((req, res, next) => {
  const start = Date.now();

  // Use a safe listener so metric collection can't crash the request
  res.on("finish", () => {
    try {
      const duration = Date.now() - start;

      // route path might be undefined for some handlers; fall back to req.path
      const routePath = (req.route && req.route.path) ? req.route.path : req.path;

      // labels must be strings
      const labels = [
        String(req.method || "UNKNOWN"),
        String(routePath || "unknown_route"),
        String(res.statusCode || 0)
      ];

      // Record metrics
      httpRequestDuration.labels(...labels).observe(duration);
      httpRequestTotal.labels(...labels).inc();
    } catch (err) {
      // Never throw from metrics collection — just log
      console.error("Metrics collection error:", err);
    }
  });

  next();
});

connectDB();

// JSON parser
app.use(express.json());

// --------------------------
// ⭐ ADD ROOT & HEALTH ROUTES
// --------------------------
app.get("/", (req, res) => {
  res.status(200).send("PrepAI backend is running 🚀");
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// --------------------------
// API Routes
// --------------------------
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/questions", questionRoutes);

app.use("/api/ai/generate-questions", protect, generateInterviewQuestions);
app.use("/api/ai/generate-explanation", protect, generateConceptExplanation);

// Serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --------------------------
// ⭐ Ensure Docker can access server
// --------------------------
// at the end of server.js
const PORT = process.env.PORT || 8000;

if (require.main === module) {
  // started directly: start the server
  app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
}

// export app for tests
module.exports = app;