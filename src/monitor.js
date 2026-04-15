const EventEmitter = require("events");
const AnomalyDetector = require("./anomalyDetector");
const { trackDependencyCheck, updateSignals } = require("./metrics");

const round = (value) => Math.round(value * 100) / 100;

const percentile = (values, percentileValue) => {
  if (values.length === 0) {
    return 0;
  }

  const ordered = [...values].sort((a, b) => a - b);
  const index = Math.max(0, Math.ceil(percentileValue * ordered.length) - 1);
  return ordered[index];
};

class Monitor extends EventEmitter {
  constructor(options) {
    super();
    this.targets = options.targets;
    this.checkTimeoutMs = options.checkTimeoutMs;
    this.checkIntervalMs = options.checkIntervalMs;
    this.samples = [];
    this.maxSamples = 1800;
    this.timer = null;
    this.detector = new AnomalyDetector({
      windowSize: 240,
      zScoreThreshold: 2.25
    });
    this.snapshot = {
      availability: 100,
      errorRate: 0,
      p95Latency: 0,
      anomalyScore: 0,
      lastCheckAt: null
    };
  }

  start() {
    if (this.timer !== null) {
      return;
    }

    this.run();
    this.timer = setInterval(() => {
      this.run().catch((error) => {
        this.emit("error", error);
      });
    }, this.checkIntervalMs);
  }

  stop() {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  getSnapshot() {
    return this.snapshot;
  }

  async run() {
    const checks = this.targets.length > 0 ? this.targets.map((target) => this.#checkTarget(target)) : [this.#generateSyntheticSample()];
    const entries = await Promise.all(checks);
    const now = Date.now();

    for (const entry of entries) {
      this.samples.push({
        ...entry,
        timestamp: now
      });
      if (this.samples.length > this.maxSamples) {
        this.samples.shift();
      }

      trackDependencyCheck({
        target: entry.target,
        isSuccess: entry.isSuccess,
        durationMs: entry.durationMs
      });
    }

    const successCount = this.samples.filter((sample) => sample.isSuccess).length;
    const availability = this.samples.length > 0 ? (successCount / this.samples.length) * 100 : 100;
    const errorRate = 100 - availability;
    const p95Latency = percentile(
      this.samples.map((sample) => sample.durationMs),
      0.95
    );

    const compositeSignal = errorRate * 1.1 + p95Latency / 100;
    const detection = this.detector.next(compositeSignal);

    this.snapshot = {
      availability: round(availability),
      errorRate: round(errorRate),
      p95Latency: round(p95Latency),
      anomalyScore: round(detection.anomalyScore),
      lastCheckAt: new Date(now).toISOString(),
      totalSamples: this.samples.length,
      anomalyDetected: detection.isAnomaly
    };

    updateSignals({
      availability: this.snapshot.availability,
      errorRate: this.snapshot.errorRate,
      p95Latency: this.snapshot.p95Latency,
      anomaly: this.snapshot.anomalyScore
    });

    this.emit("snapshot", this.snapshot);
    if (detection.isAnomaly) {
      this.emit("anomaly", this.snapshot);
    }
  }

  async #checkTarget(target) {
    const start = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.checkTimeoutMs);
    let isSuccess = false;

    try {
      const response = await fetch(target, {
        signal: controller.signal
      });
      isSuccess = response.ok;
    } catch (error) {
      isSuccess = false;
    } finally {
      clearTimeout(timeout);
    }

    return {
      target,
      isSuccess,
      durationMs: Date.now() - start
    };
  }

  async #generateSyntheticSample() {
    const isSuccess = Math.random() > 0.02;
    const latency = Math.floor(80 + Math.random() * 300);

    return {
      target: "synthetic://self-check",
      isSuccess,
      durationMs: latency
    };
  }
}

module.exports = Monitor;
