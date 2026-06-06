# MCP GitHub setup

This workspace is prepared so source code can be pushed to GitHub while local tokens stay off Git.

## Do not commit

- `.env`
- `.env.*` except `.env.example`
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

3. Create local secrets:

```bash
node scripts/setup-vscode-mcp-secrets.mjs
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
- All three start the same local MCP servers and the servers read secrets from `.vscode/mcp.local.env`.

## VS Code files

- `.vscode/mcp.json` is safe to commit.
- `.vscode/mcp.local.env` is local only.
- `.vscode/google.tokens.local.json` is local only.
- `.vscode/clarity.projects.local.json` is local only.
