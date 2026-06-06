import axios from "axios";

const API_ORIGIN = "https://api.mangools.com";

function buildPath(path) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return cleanPath.startsWith("/v3/") ? cleanPath : `/v3${cleanPath}`;
}

export function createMangoolsClient() {
  const apiKey = process.env.MANGOOLS_API_KEY;
  if (!apiKey) {
    throw new Error("Missing MANGOOLS_API_KEY. Add it to your local MCP env file.");
  }

  const http = axios.create({
    baseURL: API_ORIGIN,
    headers: {
      "x-access-token": apiKey,
      "Content-Type": "application/json",
    },
    timeout: 60000,
  });

  return {
    async request({ method, path, query, body }) {
      const response = await http.request({
        method,
        url: buildPath(path),
        params: query,
        data: body,
      });

      return response.data;
    },
  };
}
