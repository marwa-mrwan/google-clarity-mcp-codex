import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const vscodeDir = path.join(rootDir, ".vscode");
const envPath = path.join(vscodeDir, "mcp.local.env");

const rl = readline.createInterface({ input, output });

function clean(value) {
  return String(value || "").trim();
}

async function ask(label, options = {}) {
  const suffix = options.optional ? " (optional)" : "";
  const value = clean(await rl.question(`${label}${suffix}: `));
  return value;
}

function line(key, value) {
  return value ? `${key}=${value}` : undefined;
}

async function main() {
  fs.mkdirSync(vscodeDir, { recursive: true });

  const googleClientId = await ask("GOOGLE_CLIENT_ID");
  const googleClientSecret = await ask("GOOGLE_CLIENT_SECRET");
  const googleAdsDeveloperToken = await ask("GOOGLE_ADS_DEVELOPER_TOKEN", { optional: true });
  const googleAdsLoginCustomerId = await ask("GOOGLE_ADS_LOGIN_CUSTOMER_ID", { optional: true });
  const mangoolsApiKey = await ask("MANGOOLS_API_KEY", { optional: true });

  const clarityProjectName = await ask("Clarity project name", { optional: true });
  const clarityProjectLabel = clarityProjectName
    ? await ask("Clarity project label", { optional: true })
    : "";
  const clarityApiToken = clarityProjectName
    ? await ask("Clarity Data Export token")
    : "";

  const envLines = [
    "# Local MCP secrets. Do not commit this file.",
    line("GOOGLE_CLIENT_ID", googleClientId),
    line("GOOGLE_CLIENT_SECRET", googleClientSecret),
    line("GOOGLE_ADS_DEVELOPER_TOKEN", googleAdsDeveloperToken),
    line("GOOGLE_ADS_LOGIN_CUSTOMER_ID", googleAdsLoginCustomerId),
    "GOOGLE_TOKEN_FILE=../.vscode/google.tokens.local.json",
    line("MANGOOLS_API_KEY", mangoolsApiKey),
  ].filter(Boolean);

  if (clarityProjectName && clarityApiToken) {
    const clarityConfig = {
      projects: [
        {
          name: clarityProjectName,
          label: clarityProjectLabel || clarityProjectName,
          token: clarityApiToken,
        },
      ],
    };
    envLines.push(
      `CLARITY_PROJECTS_JSON_BASE64=${Buffer.from(
        JSON.stringify(clarityConfig),
        "utf8"
      ).toString("base64")}`
    );
  }

  fs.writeFileSync(envPath, `${envLines.join("\n")}\n`);

  console.log(`\nWrote ${path.relative(rootDir, envPath)}`);
  console.log("\nFor Google OAuth, run:");
  console.log("  cd google-mcp");
  console.log("  npm run auth");
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => rl.close());
