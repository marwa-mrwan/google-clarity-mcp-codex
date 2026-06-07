/**
 * Microsoft Clarity MCP Server
 * Data Export API wrapper for live dashboard insights.
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

import { createClarityClient } from "./lib/clarity-client.js";
import { getClarityTools, handleClarityTool } from "./lib/clarity-tools.js";
import { listSafeProjects, loadProjects, resolveProject } from "./lib/projects.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
for (const envFile of [
  process.env.MCP_SECRETS_ENV_FILE,
  path.join(__dirname, ".env.local"),
  path.join(__dirname, "..", ".vscode", "mcp.local.env"),
  path.join(__dirname, ".env"),
].filter(Boolean)) {
  dotenv.config({ path: envFile, override: false });
}

export const ALL_TOOLS = getClarityTools();

const server = new Server(
  { name: "microsoft-clarity-mcp-server", version: "1.0.0" },
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
    const { configPath, projects } = loadProjects(__dirname);
    const context = {
      configPath,
      listProjects: () => listSafeProjects(projects),
      getProjectNames: () => projects.map((project) => project.name),
      resolveProject: (projectName) => resolveProject(projects, projectName),
      createClient: (project) => createClarityClient({ apiToken: project.token }),
    };
    const result = await handleClarityTool(name, args, context);

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
  console.error("Microsoft Clarity MCP Server is running.");
  console.error(`Tools available: ${ALL_TOOLS.length}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });
}
