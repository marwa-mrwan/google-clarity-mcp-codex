# google-clarity-mangools-mcp-codex GitHub setup

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
```

3. Create one local secrets file at `.vscode/mcp.local.env`:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_ADS_DEVELOPER_TOKEN=...
GOOGLE_ADS_LOGIN_CUSTOMER_IDS=1234567890,9876543210
GOOGLE_ADS_API_VERSION=v24
GOOGLE_TOKEN_FILE=../.vscode/google.tokens.local.json
```

`GOOGLE_ADS_API_VERSION` is optional. If you leave it out, the Google MCP server tries supported Google Ads API versions automatically.

4. Create one local account mapping file at `.vscode/marketing.accounts.local.json`:

```json
{
  "accounts": [
    {
      "name": "example_account",
      "label": "Example Account",
      "website": "https://example.com/",
      "analytics_property_id": "123456789",
      "clarity_token": "PASTE_CLARITY_DATA_EXPORT_TOKEN"
    }
  ]
}
```

Use one object per client/account. To add a new account, copy one object and change `name`, `label`, `website`, `analytics_property_id`, and `clarity_token`.

If you already have a GA4 properties file and an old local env file with `CLARITY_PROJECTS_JSON_BASE64`, generate the shared local account file with:

```bash
node scripts/build-marketing-accounts.mjs \
  --analytics /path/to/legacy-ga4-properties.json \
  --env /path/to/mcp.local.env
```

5. Connect Google OAuth:

```bash
cd google-mcp
npm run auth
```

6. Open the workspace in VS Code/Codex and run `MCP: List Servers` if your client exposes that command.

## Codex configs

- Codex reads `.codex/config.toml`.
- VS Code-compatible MCP clients can read `.vscode/mcp.json`.
- The local MCP servers read secrets from one local file: `.vscode/mcp.local.env`.

## VS Code files

- `.vscode/mcp.json` is safe to commit.
- `.vscode/mcp.local.env` is local only.
- `.vscode/google.tokens.local.json` is local only.
- `.vscode/marketing.accounts.local.json` is local only.
- GA4 and Clarity can share `.vscode/marketing.accounts.local.json`, so each account has one editable row with its website, Analytics property ID, and Clarity token.
- Legacy Clarity multi-project tokens can still live inside `.vscode/mcp.local.env` as `CLARITY_PROJECTS_JSON_BASE64`, but the account mapping file is easier to maintain.
