/**
 * One-time Google OAuth setup.
 * Run with: npm run auth
 */

import dotenv from "dotenv";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { createOAuthClient, getAuthUrl, saveTokens } from "./lib/google-auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
for (const envFile of [
  process.env.MCP_SECRETS_ENV_FILE,
  path.join(__dirname, ".env.local"),
  path.join(__dirname, "..", ".vscode", "mcp.local.env"),
  path.join(__dirname, ".env"),
].filter(Boolean)) {
  dotenv.config({ path: envFile, override: false });
}

const PORT = 3001;

console.log("Starting Google OAuth flow...\n");

const authUrl = getAuthUrl();
console.log("Open this URL in your browser:\n");
console.log(authUrl);
console.log("\nWaiting for callback on http://localhost:3001/callback ...\n");

try {
  const { default: open } = await import("open");
  await open(authUrl);
} catch {
  console.log("Open the URL manually if the browser did not launch.");
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost:3001");

  if (url.pathname !== "/callback") {
    res.end("Not found");
    return;
  }

  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    res.end(`<h1>Error: ${error}</h1>`);
    server.close();
    process.exit(1);
  }

  if (!code) {
    res.end("<h1>No code received</h1>");
    server.close();
    process.exit(1);
  }

  try {
    const client = createOAuthClient();
    const { tokens } = await client.getToken(code);
    saveTokens(tokens);

    res.end(`
      <html><body style="font-family:sans-serif; padding:40px; text-align:center">
        <h1>Google OAuth connected successfully</h1>
        <p>You can close this window and return to the terminal.</p>
      </body></html>
    `);

    console.log("Saved Google OAuth tokens to the configured local token file.");
    console.log("You can now start the MCP server with: npm start");

    server.close();
    process.exit(0);
  } catch (err) {
    res.end(`<h1>Error: ${err.message}</h1>`);
    console.error("Error exchanging code:", err);
    server.close();
    process.exit(1);
  }
});

server.listen(PORT, () => {
  console.log(`Local OAuth callback server is running on http://localhost:${PORT}`);
});
