const parseInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return fallback;
  }
  return parsed;
};

module.exports = {
  port: parseInteger(process.env.ALERT_ROUTER_PORT, 3100),
  slackWebhookUrl: process.env.SLACK_WEBHOOK_URL || "",
  slackChannelMap: {
    critical: process.env.SLACK_CHANNEL_CRITICAL || "#reliability-critical",
    warning: process.env.SLACK_CHANNEL_WARNING || "#reliability-warning",
    info: process.env.SLACK_CHANNEL_INFO || "#reliability-info"
  },
  awsRegion: process.env.AWS_REGION || "us-east-1",
  cloudWatchNamespace: process.env.CLOUDWATCH_NAMESPACE || "ReliabilityHub/Alerts"
};
