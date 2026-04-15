const parseInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return fallback;
  }
  return parsed;
};

const parseTargets = (input) => {
  if (!input) {
    return [];
  }

  return input
    .split(",")
    .map((target) => target.trim())
    .filter(Boolean);
};

module.exports = {
  port: parseInteger(process.env.PORT, 3000),
  checkIntervalMs: parseInteger(process.env.CHECK_INTERVAL_MS, 15000),
  checkTimeoutMs: parseInteger(process.env.CHECK_TIMEOUT_MS, 5000),
  dependencyTargets: parseTargets(process.env.DEPENDENCY_TARGETS),
  availabilitySLO: Number.parseFloat(process.env.AVAILABILITY_SLO || "99.9"),
  errorRateThreshold: Number.parseFloat(process.env.ERROR_RATE_THRESHOLD || "1.5"),
  latencyThresholdMs: parseInteger(process.env.LATENCY_THRESHOLD_MS, 350)
};
