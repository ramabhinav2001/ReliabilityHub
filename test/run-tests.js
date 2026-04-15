const assert = require("node:assert/strict");
const AnomalyDetector = require("../src/anomalyDetector");

const testSpikeDetection = () => {
  const detector = new AnomalyDetector({
    windowSize: 20,
    zScoreThreshold: 2.0
  });

  for (let i = 0; i < 20; i += 1) {
    detector.next(10);
  }

  const result = detector.next(100);
  assert.equal(result.isAnomaly, true, "Expected spike to be flagged");
  assert.ok(result.anomalyScore > 0, "Expected anomaly score to be positive");
};

const testStableValues = () => {
  const detector = new AnomalyDetector({
    windowSize: 20,
    zScoreThreshold: 2.0
  });

  for (let i = 0; i < 20; i += 1) {
    detector.next(25 + (i % 2));
  }

  const result = detector.next(26);
  assert.equal(result.isAnomaly, false, "Expected stable values not to be flagged");
};

const main = () => {
  testSpikeDetection();
  testStableValues();
  console.log("All tests passed.");
};

main();
