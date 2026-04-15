const postToSlack = async ({ webhookUrl, message }) => {
  if (!webhookUrl) {
    return {
      skipped: true,
      reason: "SLACK_WEBHOOK_URL not configured"
    };
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(message)
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Slack webhook failed with status ${response.status}: ${body}`);
  }

  return {
    skipped: false
  };
};

module.exports = {
  postToSlack
};
