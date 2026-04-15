class AnomalyDetector {
  constructor(options = {}) {
    this.windowSize = options.windowSize ?? 120;
    this.zScoreThreshold = options.zScoreThreshold ?? 2.5;
    this.ewmaAlpha = options.ewmaAlpha ?? 0.25;
    this.values = [];
    this.ewma = null;
  }

  next(value) {
    if (!Number.isFinite(value)) {
      return {
        anomalyScore: 0,
        isAnomaly: false,
        zScore: 0
      };
    }

    const baseline = this.#baseline();
    let zScore = 0;
    if (baseline.stdDev > 0) {
      zScore = (value - baseline.mean) / baseline.stdDev;
    } else if (this.values.length > 5 && value > baseline.mean) {
      // If the window was flat, treat a sudden positive jump as strong anomaly.
      zScore = this.zScoreThreshold + 1;
    }

    this.ewma = this.ewma === null ? value : this.ewmaAlpha * value + (1 - this.ewmaAlpha) * this.ewma;
    const ewmaDrift = Math.abs(value - this.ewma);
    const anomalyScore = Math.max(0, Math.abs(zScore) * 0.8 + ewmaDrift * 0.2);
    const isAnomaly = zScore > this.zScoreThreshold;

    this.values.push(value);
    if (this.values.length > this.windowSize) {
      this.values.shift();
    }

    return {
      anomalyScore,
      isAnomaly,
      zScore
    };
  }

  #baseline() {
    if (this.values.length === 0) {
      return {
        mean: 0,
        stdDev: 0
      };
    }

    const mean = this.values.reduce((sum, entry) => sum + entry, 0) / this.values.length;
    const variance =
      this.values.reduce((sum, entry) => sum + (entry - mean) ** 2, 0) / this.values.length;

    return {
      mean,
      stdDev: Math.sqrt(variance)
    };
  }
}

module.exports = AnomalyDetector;
