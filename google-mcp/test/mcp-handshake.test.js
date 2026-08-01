import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const serverDirectory = path.resolve(testDirectory, "..");

test("Google MCP starts and lists the expanded tool registry", { timeout: 15_000 }, async () => {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [path.join(serverDirectory, "index.js")],
    cwd: serverDirectory,
    stderr: "pipe",
  });
  const client = new Client({ name: "google-mcp-test", version: "1.0.0" });

  try {
    await client.connect(transport);
    const response = await client.listTools();
    const names = response.tools.map((item) => item.name);
    assert.ok(names.length >= 130);
    assert.ok(names.includes("ads_discover_accounts"));
    assert.ok(names.includes("gbp_api_call"));
    assert.ok(names.includes("merchant_api_call"));
  } finally {
    await client.close();
  }
});
