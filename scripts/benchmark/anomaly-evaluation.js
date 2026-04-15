const AnomalyDetector = require("../../src/anomalyDetector");

const seededRandom = (seed) => {
  let current = seed;
  return () => {
    current = (current * 1664525 + 1013904223) % 4294967296;
    return current / 4294967296;
  };
};

const random = seededRandom(42);

const generateSeries = (length) => {
  const values = [];
  const labels = [];
  for (let i = 0; i < length; i += 1) {
    const noise = (random() - 0.5) * 12;
    let value = 110 + noise;
    let isAnomaly = false;

    if ((i > 400 && i < 450) || (i > 980 && i < 1020) || (i > 1500 && i < 1540)) {
      value += 120 + random() * 90;
      isAnomaly = true;
    }

    if (i > 1250 && i < 1320) {
      value += 45 + random() * 30;
      isAnomaly = true;
    }

    values.push(value);
    labels.push(isAnomaly ? 1 : 0);
  }

  return {
    values,
    labels
  };
};

const movingStats = (values, index, windowSize) => {
  const start = Math.max(0, index - windowSize);
  const window = values.slice(start, index);
  if (window.length < 10) {
    return { mean: values[index], stdDev: 1 };
  }

  const mean = window.reduce((sum, entry) => sum + entry, 0) / window.length;
  const variance = window.reduce((sum, entry) => sum + (entry - mean) ** 2, 0) / window.length;
  return { mean, stdDev: Math.sqrt(variance) };
};

const classifyBaseline = (values) => {
  const predictions = [];
  for (let i = 0; i < values.length; i += 1) {
    const stats = movingStats(values, i, 60);
    predictions.push(values[i] > stats.mean + stats.stdDev * 2.6 ? 1 : 0);
  }
  return predictions;
};

const classifyDetector = (values) => {
  const detector = new AnomalyDetector({
    windowSize: 120,
    zScoreThreshold: 2.0,
    ewmaAlpha: 0.22
  });

  return values.map((value) => (detector.next(value).isAnomaly ? 1 : 0));
};

const score = (predictions, labels) => {
  let tp = 0;
  let fp = 0;
  let tn = 0;
  let fn = 0;

  for (let i = 0; i < labels.length; i += 1) {
    if (predictions[i] === 1 && labels[i] === 1) tp += 1;
    if (predictions[i] === 1 && labels[i] === 0) fp += 1;
    if (predictions[i] === 0 && labels[i] === 0) tn += 1;
    if (predictions[i] === 0 && labels[i] === 1) fn += 1;
  }

  const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
  const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
  const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
  const accuracy = (tp + tn) / labels.length;

  return {
    tp,
    fp,
    tn,
    fn,
    precision,
    recall,
    f1,
    accuracy
  };
};

const percent = (value) => `${(value * 100).toFixed(2)}%`;

const main = () => {
  const { values, labels } = generateSeries(2000);
  const baselineScores = score(classifyBaseline(values), labels);
  const detectorScores = score(classifyDetector(values), labels);
  const improvement = ((detectorScores.f1 - baselineScores.f1) / baselineScores.f1) * 100;

  console.log("ReliabilityHub anomaly evaluation");
  console.log("--------------------------------");
  console.log(`Baseline F1: ${percent(baselineScores.f1)}`);
  console.log(`Detector F1: ${percent(detectorScores.f1)}`);
  console.log(`F1 improvement: ${improvement.toFixed(2)}%`);
  console.log("");
  console.log(`Baseline accuracy: ${percent(baselineScores.accuracy)}`);
  console.log(`Detector accuracy: ${percent(detectorScores.accuracy)}`);
};

main();
