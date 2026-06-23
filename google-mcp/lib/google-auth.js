import { google } from "googleapis";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_TOKEN_PATH = path.join(__dirname, "..", "tokens.json");

function getTokenPath() {
  const configuredPath = process.env.GOOGLE_TOKEN_FILE;
  if (!configuredPath) {
    return DEFAULT_TOKEN_PATH;
  }

  return path.isAbsolute(configuredPath)
    ? configuredPath
    : path.resolve(__dirname, "..", configuredPath);
}

const SCOPES = [
  "openid",
  "https://www.googleapis.com/auth/webmasters",
  "https://www.googleapis.com/auth/analytics.readonly",
  "https://www.googleapis.com/auth/analytics.edit",
  "https://www.googleapis.com/auth/analytics.manage.users",
  "https://www.googleapis.com/auth/tagmanager.readonly",
  "https://www.googleapis.com/auth/tagmanager.edit.containers",
  "https://www.googleapis.com/auth/tagmanager.delete.containers",
  "https://www.googleapis.com/auth/tagmanager.edit.containerversions",
  "https://www.googleapis.com/auth/tagmanager.publish",
  "https://www.googleapis.com/auth/tagmanager.manage.users",
  "https://www.googleapis.com/auth/tagmanager.manage.accounts",
  "https://www.googleapis.com/auth/adwords",
  "https://www.googleapis.com/auth/business.manage",
  "https://www.googleapis.com/auth/content",
];

export function createOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "http://localhost:3001/callback"
  );
}

export function getAuthUrl() {
  const client = createOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });
}

export async function getAuthenticatedClient() {
  const client = createOAuthClient();
  const tokenPath = getTokenPath();

  // Prefer tokens.json because it can contain all requested scopes.
  if (fs.existsSync(tokenPath)) {
    const tokens = JSON.parse(fs.readFileSync(tokenPath, "utf8"));
    client.setCredentials(tokens);
    client.on("tokens", (newTokens) => {
      const updated = { ...tokens, ...newTokens };
      fs.writeFileSync(tokenPath, JSON.stringify(updated, null, 2));
    });
    return client;
  }

  // Fallback: refresh token from environment/plugin settings.
  if (process.env.GOOGLE_REFRESH_TOKEN) {
    client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });
    return client;
  }

  throw new Error(
    "No Google refresh token found. Add GOOGLE_REFRESH_TOKEN to your local MCP env file or run npm run auth."
  );
}

export function saveTokens(tokens) {
  const tokenPath = getTokenPath();
  fs.mkdirSync(path.dirname(tokenPath), { recursive: true });
  fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2));
}
