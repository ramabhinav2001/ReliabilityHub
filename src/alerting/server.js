const express = require("express");
const config = require("./config");
const CloudWatchPublisher = require("./cloudWatch");
const { postToSlack } = require("./slack");
const { groupAlerts, buildSlackMessage, detectionLatencySeconds, average } = require("./processor");

const app = express();
app.use(express.json({ limit: "2mb" }));

const cloudWatchPublisher = new CloudWatchPublisher({
  region: config.awsRegion,
  namespace: config.cloudWatchNamespace
});

const resolveChannel = (severity) => config.slackChannelMap[severity] || config.slackChannelMap.info;

app.get("/health", (_request, response) => {
  response.status(200).json({
    status: "ok",
    service: "reliabilityhub-alert-router"
  });
});

app.post("/alerts", async (request, response) => {
  const alerts = Array.isArray(request.body?.alerts) ? request.body.alerts : [];
  if (alerts.length === 0) {
    return response.status(202).json({
      accepted: true,
      processed: 0
    });
  }

  const grouped = groupAlerts(alerts);
  const results = [];

  for (const [severity, severityAlerts] of Object.entries(grouped)) {
    const service = severityAlerts[0]?.labels?.service || "unknown";
    const latencies = severityAlerts.map((alert) => detectionLatencySeconds(alert.startsAt));
    const alertCount = severityAlerts.length;
    const avgLatency = average(latencies);

    try {
      await postToSlack({
        webhookUrl: config.slackWebhookUrl,
        message: buildSlackMessage({
          severity,
          channel: resolveChannel(severity),
          alerts: severityAlerts
        })
      });

      await cloudWatchPublisher.publishAlertMetrics({
        severity,
        service,
        alertCount,
        detectionLatencySeconds: avgLatency
      });

      results.push({
        severity,
        service,
        status: "published",
        alertCount,
        avgDetectionLatencySeconds: Number(avgLatency.toFixed(2))
      });
    } catch (error) {
      console.error("Alert processing failed", error);
      results.push({
        severity,
        service,
        status: "failed",
        reason: error.message
      });
    }
  }

  return response.status(202).json({
    accepted: true,
    processed: alerts.length,
    results
  });
});

app.listen(config.port, () => {
  console.log(`ReliabilityHub alert router listening on port ${config.port}`);
});
