import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const sourcePlugin = path.join(repoRoot, "plugins", "marwa-marketing-mcp");
const home = os.homedir();
const targetPluginRoot = path.join(home, "plugins");
const targetPlugin = path.join(targetPluginRoot, "marwa-marketing-mcp");
const agentsPluginDir = path.join(home, ".agents", "plugins");
const marketplacePath = path.join(agentsPluginDir, "marketplace.json");
const codexConfigPath = path.join(home, ".codex", "config.toml");
const mcpRoot = path.join(repoRoot, "codex-mcp-plugins");
const secretsFile = path.join(mcpRoot, ".vscode", "mcp.local.env");
const googleTokenFile = path.join(mcpRoot, ".vscode", "google.tokens.local.json");

function upsertMarketplace() {
  fs.mkdirSync(agentsPluginDir, { recursive: true });

  let marketplace = {
    name: "marwa-local",
    interface: {
      displayName: "Marwa Local Plugins",
    },
    plugins: [],
  };

  if (fs.existsSync(marketplacePath)) {
    marketplace = JSON.parse(fs.readFileSync(marketplacePath, "utf8"));
    marketplace.plugins ??= [];
    marketplace.interface ??= { displayName: "Marwa Local Plugins" };
  }

  const entry = {
    name: "marwa-marketing-mcp",
    source: {
      source: "local",
      path: "./plugins/marwa-marketing-mcp",
    },
    policy: {
      installation: "AVAILABLE",
      authentication: "ON_USE",
    },
    category: "Marketing",
  };

  const index = marketplace.plugins.findIndex((plugin) => plugin.name === entry.name);
  if (index >= 0) {
    marketplace.plugins[index] = entry;
  } else {
    marketplace.plugins.push(entry);
  }

  fs.writeFileSync(marketplacePath, `${JSON.stringify(marketplace, null, 2)}\n`);
}

function tomlString(value) {
  return JSON.stringify(value);
}

function mcpBlock(name, scriptPath, extraEnv = {}) {
  const env = {
    MCP_SECRETS_ENV_FILE: secretsFile,
    ...extraEnv,
  };
  const envParts = Object.entries(env)
    .map(([key, value]) => `${key} = ${tomlString(value)}`)
    .join(", ");

  return [
    `[mcp_servers.${name}]`,
    `command = "node"`,
    `args = [${tomlString(scriptPath)}]`,
    `startup_timeout_sec = 20`,
    `tool_timeout_sec = 120`,
    `env = { ${envParts} }`,
    "",
  ].join("\n");
}

function upsertCodexConfig() {
  fs.mkdirSync(path.dirname(codexConfigPath), { recursive: true });
  let config = fs.existsSync(codexConfigPath)
    ? fs.readFileSync(codexConfigPath, "utf8").trimEnd()
    : "";

  const pluginKey = `[plugins."marwa-marketing-mcp@marwa-local"]`;
  if (!config.includes(pluginKey)) {
    config += `\n\n${pluginKey}\nenabled = true`;
  }

  const servers = [
    {
      name: "google-marketing-suite",
      script: path.join(mcpRoot, "google-mcp", "index.js"),
      env: { GOOGLE_TOKEN_FILE: googleTokenFile },
    },
    {
      name: "microsoft-clarity",
      script: path.join(mcpRoot, "clarity-mcp", "index.js"),
      env: {},
    },
    {
      name: "mangools",
      script: path.join(mcpRoot, "mangools-mcp", "index.js"),
      env: {},
    },
  ];

  for (const server of servers) {
    const header = `[mcp_servers.${server.name}]`;
    if (!config.includes(header)) {
      config += `\n\n${mcpBlock(server.name, server.script, server.env).trimEnd()}`;
    }
  }

  fs.writeFileSync(codexConfigPath, `${config.trimEnd()}\n`);
}

fs.mkdirSync(targetPluginRoot, { recursive: true });
fs.rmSync(targetPlugin, { recursive: true, force: true });
fs.cpSync(sourcePlugin, targetPlugin, { recursive: true });
upsertMarketplace();
upsertCodexConfig();

console.log(`Installed plugin: ${targetPlugin}`);
console.log(`Updated marketplace: ${marketplacePath}`);
console.log(`Updated Codex config: ${codexConfigPath}`);
