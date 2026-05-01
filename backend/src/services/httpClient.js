import { HttpError } from "../utils/httpError.js";

export async function postJson(url, body, { timeoutMs = 30000 } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const text = await response.text();
    const payload = text ? safeJsonParse(text) : null;

    if (!response.ok) {
      throw new HttpError(
        response.status >= 500 ? 502 : response.status,
        "upstream_error",
        payload?.message || `Upstream request failed with status ${response.status}`,
        payload
      );
    }

    return payload;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new HttpError(504, "upstream_timeout", "Upstream request timed out");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}
