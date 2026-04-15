const { CloudWatchClient, PutMetricDataCommand } = require("@aws-sdk/client-cloudwatch");

class CloudWatchPublisher {
  constructor(options) {
    this.namespace = options.namespace;
    this.client = new CloudWatchClient({
      region: options.region
    });
  }

  async publishAlertMetrics({ severity, service, alertCount, detectionLatencySeconds }) {
    const command = new PutMetricDataCommand({
      Namespace: this.namespace,
      MetricData: [
        {
          MetricName: "AlertCount",
          Dimensions: [
            { Name: "severity", Value: severity },
            { Name: "service", Value: service }
          ],
          Unit: "Count",
          Value: alertCount
        },
        {
          MetricName: "DetectionLatencySeconds",
          Dimensions: [
            { Name: "severity", Value: severity },
            { Name: "service", Value: service }
          ],
          Unit: "Seconds",
          Value: detectionLatencySeconds
        }
      ]
    });

    return this.client.send(command);
  }
}

module.exports = CloudWatchPublisher;
