import axios from "axios";

const DEFAULT_BASE_URL = "https://www.clarity.ms/export-data/api/v1";

export function createClarityClient({
  apiToken,
  baseUrl = process.env.CLARITY_BASE_URL || DEFAULT_BASE_URL,
} = {}) {
  if (!apiToken) {
    throw new Error(
      "Missing CLARITY_API_TOKEN. Add it to clarity-mcp/.env or pass it in the MCP server environment."
    );
  }

  const client = axios.create({
    baseURL: baseUrl,
    timeout: 30000,
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
  });

  return {
    async getLiveInsights(params) {
      const response = await client.get("/project-live-insights", { params });
      return response.data;
    },
  };
}
