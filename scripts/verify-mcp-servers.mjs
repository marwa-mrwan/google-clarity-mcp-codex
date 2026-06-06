import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const servers = [
  { name: "google-marketing-suite", dir: "google-mcp" },
  { name: "microsoft-clarity", dir: "clarity-mcp" },
  { name: "mangools", dir: "mangools-mcp" },
];

function send(child, payload) {
  child.stdin.write(`${JSON.stringify(payload)}\n`);
}

function parseLines(buffer, onMessage) {
  let pending = "";
  return (chunk) => {
    pending += chunk.toString("utf8");
    const lines = pending.split(/\r?\n/);
    pending = lines.pop() || "";
    for (const line of lines) {
      if (!line.trim()) {
        continue;
      }
      try {
        onMessage(JSON.parse(line));
      } catch {
        // MCP protocol messages are JSON lines; ignore non-protocol output.
      }
    }
  };
}

async function verifyServer(server) {
  const child = spawn("node", [path.join(rootDir, server.dir, "index.js")], {
    cwd: rootDir,
    env: {
      ...process.env,
      MCP_SECRETS_ENV_FILE: path.join(rootDir, ".vscode", "mcp.local.env"),
    },
    stdio: ["pipe", "pipe", "pipe"],
    windowsHide: true,
  });

  const result = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error(`${server.name}: timed out while listing tools`));
    }, 15000);

    child.once("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    child.stdout.on(
      "data",
      parseLines("", (message) => {
        if (message.id === 1 && message.result) {
          send(child, {
            jsonrpc: "2.0",
            method: "notifications/initialized",
            params: {},
          });
          send(child, {
            jsonrpc: "2.0",
            id: 2,
            method: "tools/list",
            params: {},
          });
        }

        if (message.id === 2) {
          clearTimeout(timeout);
          child.kill();
          const tools = message.result?.tools || [];
          resolve({ name: server.name, tools: tools.length });
        }
      })
    );

    send(child, {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: {
          name: "mcp-repo-verifier",
          version: "1.0.0",
        },
      },
    });
  });

  return result;
}

const results = [];
for (const server of servers) {
  results.push(await verifyServer(server));
}

for (const result of results) {
  console.log(`${result.name}: ${result.tools} tools`);
}
