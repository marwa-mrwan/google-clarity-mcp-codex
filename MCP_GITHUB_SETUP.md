# Marketing Intelligence MCP GitHub setup

This workspace is prepared so source code can be pushed to GitHub while local tokens stay off Git.

## Do not commit

- `.env`
- `.env.*`
- `tokens.json`
- `projects.json`
- `projects.local.json`
- `*.local.*`
- `node_modules/`
- `outputs/`

## New machine setup

1. Clone the repository.
2. Install dependencies:

```bash
cd google-mcp && npm install
cd ../clarity-mcp && npm install
cd ../mangools-mcp && npm install
```

3. Create one local secrets file at `.vscode/mcp.local.env`:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_ADS_DEVELOPER_TOKEN=...
GOOGLE_ADS_LOGIN_CUSTOMER_ID=...
GOOGLE_TOKEN_FILE=../.vscode/google.tokens.local.json
MANGOOLS_API_KEY=...
CLARITY_PROJECTS_JSON_BASE64=...
```

4. Connect Google OAuth:

```bash
cd google-mcp
npm run auth
```

5. Open the workspace in VS Code and run `MCP: List Servers`.

## Agent configs

- VS Code / Copilot reads `.vscode/mcp.json`.
- Claude Code reads `.mcp.json`.
- Codex reads `.codex/config.toml`.
- All three start the same local MCP servers and the servers read secrets from one local file: `.vscode/mcp.local.env`.

## VS Code files

- `.vscode/mcp.json` is safe to commit.
- `.vscode/mcp.local.env` is local only.
- `.vscode/google.tokens.local.json` is local only.
- Clarity multi-project tokens can live inside `.vscode/mcp.local.env` as `CLARITY_PROJECTS_JSON_BASE64`.
