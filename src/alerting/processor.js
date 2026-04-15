const average = (numbers) => {
  if (numbers.length === 0) {
    return 0;
  }
  const total = numbers.reduce((sum, value) => sum + value, 0);
  return total / numbers.length;
};

const detectionLatencySeconds = (startedAt) => {
  const timestamp = Date.parse(startedAt);
  if (Number.isNaN(timestamp)) {
    return 0;
  }
  return Math.max(0, (Date.now() - timestamp) / 1000);
};

const groupAlerts = (alerts) => {
  const grouped = {};

  for (const alert of alerts) {
    const severity = alert.labels?.severity || "info";
    if (!grouped[severity]) {
      grouped[severity] = [];
    }
    grouped[severity].push(alert);
  }

  return grouped;
};

const buildSlackMessage = ({ severity, channel, alerts }) => {
  const service = alerts[0]?.labels?.service || "unknown";
  const titles = alerts.map((alert) => alert.annotations?.summary || alert.labels?.alertname || "Alert");
  const descriptions = alerts.map((alert) => alert.annotations?.description || "");
  const starts = alerts.map((alert) => detectionLatencySeconds(alert.startsAt));

  return {
    channel,
    text: `[ReliabilityHub] ${severity.toUpperCase()} alert (${alerts.length})`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `ReliabilityHub ${severity.toUpperCase()} incident`
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Service:* ${service}\n*Alerts:* ${alerts.length}\n*Avg Detection Latency:* ${average(starts).toFixed(2)}s`
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Summaries*\n${titles.map((title, index) => `- ${title}: ${descriptions[index]}`).join("\n")}`
        }
      }
    ]
  };
};

module.exports = {
  groupAlerts,
  buildSlackMessage,
  detectionLatencySeconds,
  average
};
