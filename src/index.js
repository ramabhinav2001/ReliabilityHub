const express = require("express");
const config = require("./config");
const Monitor = require("./monitor");
const { registry, trackHttpRequest } = require("./metrics");

const app = express();
app.use(express.json());

const monitor = new Monitor({
  targets: config.dependencyTargets,
  checkTimeoutMs: config.checkTimeoutMs,
  checkIntervalMs: config.checkIntervalMs
});

monitor.on("anomaly", (snapshot) => {
  console.warn("Anomaly detected", snapshot);
});

monitor.on("error", (error) => {
  console.error("Monitor cycle failed", error);
});

app.use((request, response, next) => {
  const start = process.hrtime.bigint();
  response.on("finish", () => {
    const elapsed = Number(process.hrtime.bigint() - start) / 1e6;
    trackHttpRequest({
      method: request.method,
      route: request.route?.path ?? request.path,
      statusCode: response.statusCode,
      durationMs: elapsed
    });
  });
  next();
});

app.get("/health", (_request, response) => {
  const snapshot = monitor.getSnapshot();
  response.status(200).json({
    status: snapshot.availability >= config.availabilitySLO ? "ok" : "degraded",
    snapshot,
    thresholds: {
      availabilitySLO: config.availabilitySLO,
      errorRateThreshold: config.errorRateThreshold,
      latencyThresholdMs: config.latencyThresholdMs
    }
  });
});

app.get("/simulate", async (request, response) => {
  const status = Number.parseInt(String(request.query.status || "200"), 10);
  const latencyMs = Number.parseInt(String(request.query.latency || "100"), 10);
  await new Promise((resolve) => setTimeout(resolve, latencyMs));
  response.status(Number.isNaN(status) ? 200 : status).json({
    status: Number.isNaN(status) ? 200 : status,
    latencyMs
  });
});

app.get("/metrics", async (_request, response) => {
  response.set("Content-Type", registry.contentType);
  const result = await registry.metrics();
  response.status(200).send(result);
});

app.get("/", (_request, response) => {
  response.status(200).json({
    name: "ReliabilityHub",
    endpoints: ["/health", "/metrics", "/simulate"]
  });
});

app.listen(config.port, () => {
  monitor.start();
  console.log(`ReliabilityHub listening on port ${config.port}`);
});
