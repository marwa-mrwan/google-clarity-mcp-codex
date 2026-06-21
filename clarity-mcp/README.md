# Microsoft Clarity MCP

Standalone MCP server for Microsoft Clarity Data Export API.

## Setup

1. Generate a Clarity API token from your Clarity project:
   `Settings -> Data Export -> Generate new API token`
2. Add your accounts to `../.vscode/marketing.accounts.local.json`.
3. For each account, set:

```json
{
  "accounts": [
    {
      "name": "hairpro",
      "label": "Hair Pro Clinic",
      "website": "https://hairproclinic.com/",
      "analytics_property_id": "123456789",
      "clarity_token": "your_clarity_data_export_token"
    }
  ]
}
```

The old `projects.json`, `projects.local.json`, `CLARITY_PROJECTS_FILE`, and `CLARITY_PROJECTS_JSON_BASE64` options still work. The shared account file is recommended because GA4 and Clarity stay together per client.

4. Install dependencies:

```bash
npm install
```

5. Start:

```bash
npm start
```

## MCP Config

Use `.mcp.json`:

```json
{
  "mcpServers": {
    "microsoft-clarity": {
      "command": "node",
      "args": ["D:/Codex/clarity-mcp/index.js"],
      "env": {}
    }
  }
}
```

## Tools

- `clarity_options`: lists supported dimensions, metrics, and limits.
- `clarity_list_projects`: lists configured projects without exposing tokens.
- `clarity_prepare_request`: plans the request before spending Clarity API quota.
- `clarity_live_insights`: fetches raw live dashboard insights.
- `clarity_metric_summary`: fetches selected metric groups only.
- `clarity_batch_insights`: fetches the same request for multiple projects in one MCP call.
- `clarity_compare_projects`: compares multiple projects using one API call per project.
- `clarity_analyze_project`: fetches one project once and returns a practical local analysis.

## Quota-aware workflow

1. Use `clarity_list_projects` and/or `clarity_options` first. These do not call Clarity.
2. For vague user requests, use `clarity_prepare_request` first. This does not call Clarity.
3. Ask the user to confirm:
   - project name(s)
   - `numOfDays`
   - dimensions
   - metric names or analysis goal
4. Then call one final API tool:
   - one project: `clarity_analyze_project` or `clarity_metric_summary`
   - multiple projects: `clarity_compare_projects` or `clarity_batch_insights`

## Notes

- Clarity only supports `numOfDays` values `1`, `2`, or `3`.
- Maximum 3 dimensions per request.
- Maximum 10 API requests per project per day.
- API results are returned in UTC.
