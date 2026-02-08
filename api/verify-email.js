function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
      if (body.length > 200_000) {
        reject(new Error("Request body too large"));
      }
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  try {
    const body = req.body && typeof req.body === "object" ? req.body : await readJsonBody(req);
    const email = typeof body?.email === "string" ? body.email.trim() : "";

    if (!email) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: "Email is required" }));
      return;
    }

    const apiKey = process.env.ABSTRACT_EMAIL_API_KEY;
    if (!apiKey) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: "API key not configured" }));
      return;
    }

    const abstractResponse = await fetch(
      `https://emailreputation.abstractapi.com/v1/?api_key=${apiKey}&email=${encodeURIComponent(email)}`,
    );

    if (!abstractResponse.ok) {
      res.statusCode = abstractResponse.status;
      res.end(JSON.stringify({ error: "Email verification failed" }));
      return;
    }

    const data = await abstractResponse.json();
    const status = typeof data?.deliverability === "string" ? data.deliverability.toUpperCase() : "UNKNOWN";
    const verified = status === "DELIVERABLE";
    const statusDetail = data?.quality_score ? `Quality: ${data.quality_score}` : "No quality score";

    res.statusCode = 200;
    res.end(
      JSON.stringify({
        email,
        verified,
        status,
        statusDetail,
      }),
    );
  } catch (error) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
};
