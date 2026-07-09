/**
 * Google MCP Server
 * Search Console + GA4 + Google Ads + Tag Manager
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { getAuthenticatedClient } from "./lib/google-auth.js";
import { getSearchConsoleTools, handleSearchConsoleTool } from "./lib/search-console.js";
import { getAnalyticsTools, handleAnalyticsTool } from "./lib/analytics.js";
import { getAdsTools, handleAdsTool } from "./lib/ads.js";
import { getTagManagerTools, handleTagManagerTool } from "./lib/tag-manager.js";
import {
  getBusinessProfileTools,
  handleBusinessProfileTool,
} from "./lib/business-profile.js";
import { getMerchantCenterTools, handleMerchantCenterTool } from "./lib/merchant-center.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
for (const envFile of [
  process.env.MCP_SECRETS_ENV_FILE,
  path.join(__dirname, ".env.local"),
  path.join(__dirname, "..", ".vscode", "mcp.local.env"),
  path.join(__dirname, ".env"),
].filter(Boolean)) {
  dotenv.config({ path: envFile, override: false });
}

const ALL_TOOLS = [
  ...getSearchConsoleTools(),
  ...getAnalyticsTools(),
  ...getAdsTools(),
  ...getTagManagerTools(),
  ...getBusinessProfileTools(),
  ...getMerchantCenterTools(),
];

const AUTHLESS_TOOLS = new Set([
  "ga4_list_configured_properties",
]);

const server = new Server(
  { name: "google-mcp-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.onerror = (error) => {
  console.error("MCP protocol error:", error);
};

function keepStdioServerAlive() {
  setInterval(() => {}, 1 << 30);
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: ALL_TOOLS };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const authClient = AUTHLESS_TOOLS.has(name) ? null : await getAuthenticatedClient();
    let result;

    if (name.startsWith("gsc_")) {
      result = await handleSearchConsoleTool(name, args, authClient);
    } else if (name.startsWith("ga4_")) {
      result = await handleAnalyticsTool(name, args, authClient);
    } else if (name.startsWith("ads_")) {
      result = await handleAdsTool(name, args, authClient);
    } else if (name.startsWith("gtm_")) {
      result = await handleTagManagerTool(name, args, authClient);
    } else if (name.startsWith("gbp_")) {
      result = await handleBusinessProfileTool(name, args, authClient);
    } else if (name.startsWith("merchant_")) {
      result = await handleMerchantCenterTool(name, args, authClient);
    } else {
      throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}\n${
            error.response?.data ? JSON.stringify(error.response.data, null, 2) : ""
          }`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stdin.resume();
  keepStdioServerAlive();
  console.error("Google MCP Server is running.");
  console.error(`Tools available: ${ALL_TOOLS.length}`);
  console.error("   - Search Console:", getSearchConsoleTools().length);
  console.error("   - GA4:", getAnalyticsTools().length);
  console.error("   - Google Ads:", getAdsTools().length);
  console.error("   - Tag Manager:", getTagManagerTools().length);
  console.error("   - Business Profile:", getBusinessProfileTools().length);
  console.error("   - Merchant Center:", getMerchantCenterTools().length);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
