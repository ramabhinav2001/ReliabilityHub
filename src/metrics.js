const client = require("prom-client");

const registry = new client.Registry();
client.collectDefaultMetrics({
  prefix: "reliabilityhub_",
  register: registry
});

const httpRequestDurationMs = new client.Histogram({
  name: "reliabilityhub_http_request_duration_ms",
  help: "HTTP request latency in milliseconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [25, 50, 100, 200, 350, 500, 750, 1000, 2000]
});

const httpRequestsTotal = new client.Counter({
  name: "reliabilityhub_http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "route", "status_code"]
});

const dependencyChecksTotal = new client.Counter({
  name: "reliabilityhub_dependency_checks_total",
  help: "Total dependency checks",
  labelNames: ["target", "result"]
});

const dependencyLatencyMs = new client.Histogram({
  name: "reliabilityhub_dependency_latency_ms",
  help: "Dependency check latency in milliseconds",
  labelNames: ["target"],
  buckets: [50, 100, 200, 350, 500, 750, 1000, 2000, 5000]
});

const availabilityPercent = new client.Gauge({
  name: "reliabilityhub_service_availability_percent",
  help: "Rolling availability percentage"
});

const errorRatePercent = new client.Gauge({
  name: "reliabilityhub_service_error_rate_percent",
  help: "Rolling error-rate percentage"
});

const latencyP95Ms = new client.Gauge({
  name: "reliabilityhub_service_latency_p95_ms",
  help: "Rolling p95 latency for dependency checks"
});

const anomalyScore = new client.Gauge({
  name: "reliabilityhub_service_anomaly_score",
  help: "Composite anomaly score"
});

registry.registerMetric(httpRequestDurationMs);
registry.registerMetric(httpRequestsTotal);
registry.registerMetric(dependencyChecksTotal);
registry.registerMetric(dependencyLatencyMs);
registry.registerMetric(availabilityPercent);
registry.registerMetric(errorRatePercent);
registry.registerMetric(latencyP95Ms);
registry.registerMetric(anomalyScore);

const trackHttpRequest = ({ method, route, statusCode, durationMs }) => {
  const labels = {
    method,
    route,
    status_code: String(statusCode)
  };

  httpRequestDurationMs.observe(labels, durationMs);
  httpRequestsTotal.inc(labels);
};

const trackDependencyCheck = ({ target, isSuccess, durationMs }) => {
  dependencyChecksTotal.inc({
    target,
    result: isSuccess ? "success" : "failure"
  });
  dependencyLatencyMs.observe({ target }, durationMs);
};

const updateSignals = ({ availability, errorRate, p95Latency, anomaly }) => {
  availabilityPercent.set(availability);
  errorRatePercent.set(errorRate);
  latencyP95Ms.set(p95Latency);
  anomalyScore.set(anomaly);
};

module.exports = {
  registry,
  trackHttpRequest,
  trackDependencyCheck,
  updateSignals
};
