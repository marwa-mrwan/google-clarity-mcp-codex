/**
 * Mangools MCP Server
 * KWFinder + SERPChecker + SERPWatcher + LinkMiner + SiteProfiler + AI Search Watcher
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

import { createMangoolsClient } from "./lib/mangools-client.js";
import { exposeTools, handleEndpointTool } from "./lib/tool-definitions.js";
import { mangoolsDefinitions } from "./lib/mangools.js";
import { kwfinderDefinitions } from "./lib/kwfinder.js";
import { serpcheckerDefinitions } from "./lib/serpchecker.js";
import { serpwatcherDefinitions } from "./lib/serpwatcher.js";
import { linkminerDefinitions } from "./lib/linkminer.js";
import { siteprofilerDefinitions } from "./lib/siteprofiler.js";
import { aiwatcherDefinitions } from "./lib/aiwatcher.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
for (const envFile of [
  process.env.MCP_SECRETS_ENV_FILE,
  path.join(__dirname, ".env.local"),
  path.join(__dirname, "..", ".vscode", "mcp.local.env"),
  path.join(__dirname, ".env"),
].filter(Boolean)) {
  dotenv.config({ path: envFile, override: false });
}

export const ALL_DEFINITIONS = [
  ...mangoolsDefinitions,
  ...kwfinderDefinitions,
  ...serpcheckerDefinitions,
  ...serpwatcherDefinitions,
  ...linkminerDefinitions,
  ...siteprofilerDefinitions,
  ...aiwatcherDefinitions,
];

export const ALL_TOOLS = exposeTools(ALL_DEFINITIONS);

const server = new Server(
  { name: "mangools-mcp-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: ALL_TOOLS };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const client = createMangoolsClient();
    const result = await handleEndpointTool(ALL_DEFINITIONS, name, args, client);

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
  console.error("Mangools MCP Server is running.");
  console.error(`Tools available: ${ALL_TOOLS.length}`);
  console.error("   - Mangools:", mangoolsDefinitions.length);
  console.error("   - KWFinder:", kwfinderDefinitions.length);
  console.error("   - SERPChecker:", serpcheckerDefinitions.length);
  console.error("   - SERPWatcher:", serpwatcherDefinitions.length);
  console.error("   - LinkMiner:", linkminerDefinitions.length);
  console.error("   - SiteProfiler:", siteprofilerDefinitions.length);
  console.error("   - AI Search Watcher:", aiwatcherDefinitions.length);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });
}
