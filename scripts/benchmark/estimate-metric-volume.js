const secondsPerDay = 24 * 60 * 60;

const estimateSamplesPerDay = ({
  scrapeIntervalSeconds,
  appReplicas,
  targetsPerReplica,
  baseSeriesPerReplica,
  seriesPerTarget
}) => {
  const scrapesPerDay = secondsPerDay / scrapeIntervalSeconds;
  const totalSeries =
    appReplicas * (baseSeriesPerReplica + targetsPerReplica * seriesPerTarget);
  return {
    scrapesPerDay,
    totalSeries,
    samplesPerDay: Math.floor(scrapesPerDay * totalSeries)
  };
};

const config = {
  scrapeIntervalSeconds: Number.parseInt(process.env.SCRAPE_INTERVAL_SECONDS || "15", 10),
  appReplicas: Number.parseInt(process.env.APP_REPLICAS || "4", 10),
  targetsPerReplica: Number.parseInt(process.env.TARGETS_PER_REPLICA || "12", 10),
  baseSeriesPerReplica: Number.parseInt(process.env.BASE_SERIES_PER_REPLICA || "45", 10),
  seriesPerTarget: Number.parseInt(process.env.SERIES_PER_TARGET || "6", 10)
};

const result = estimateSamplesPerDay(config);

console.log("ReliabilityHub metric volume estimate");
console.log("------------------------------------");
console.log(`Scrape interval: ${config.scrapeIntervalSeconds}s`);
console.log(`App replicas: ${config.appReplicas}`);
console.log(`Targets per replica: ${config.targetsPerReplica}`);
console.log(`Total active series: ${result.totalSeries}`);
console.log(`Samples per day: ${result.samplesPerDay.toLocaleString()}`);
console.log(
  result.samplesPerDay >= 1_000_000
    ? "Result: configuration exceeds 1M metrics/day."
    : "Result: configuration below 1M metrics/day, increase replicas/targets/series."
);
