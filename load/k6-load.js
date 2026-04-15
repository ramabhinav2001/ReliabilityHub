import http from "k6/http";
import { sleep } from "k6";

export const options = {
  stages: [
    { duration: "3m", target: 60 },
    { duration: "20m", target: 140 },
    { duration: "5m", target: 0 }
  ],
  thresholds: {
    http_req_failed: ["rate<0.03"],
    http_req_duration: ["p(95)<450"]
  }
};

const baseUrl = __ENV.BASE_URL || "http://localhost:3000";

export default function () {
  http.get(`${baseUrl}/health`);
  http.get(`${baseUrl}/simulate?status=200&latency=120`);

  // Inject periodic degradation to validate alerting and anomaly detection.
  if (__ITER % 20 === 0) {
    http.get(`${baseUrl}/simulate?status=500&latency=900`);
  }

  sleep(0.2);
}
