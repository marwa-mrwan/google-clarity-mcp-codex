# Mangools MCP

MCP server for Mangools API:

- KWFinder
- SERPChecker
- SERPWatcher
- LinkMiner
- SiteProfiler
- AI Search Watcher

## Setup

```powershell
cd D:\Codex\mangools-mcp
Create `../.vscode/mcp.local.env`
```

Edit `.env`:

```env
MANGOOLS_API_KEY=your_mangools_api_key_here
```

Install dependencies:

```powershell
npm.cmd install
```

Run:

```powershell
npm.cmd start
```

## MCP Config

Use this server config:

```json
{
  "mcpServers": {
    "mangools-mcp": {
      "command": "node",
      "args": ["D:/Codex/mangools-mcp/index.js"],
      "env": {}
    }
  }
}
```

## Tool Arguments

Each tool accepts direct top-level params, plus optional raw `query` and `body` objects.

Examples:

```json
{
  "keyword": "seo agency",
  "location_id": 2840,
  "language_id": 1000
}
```

```json
{
  "query": {
    "keyword": "seo agency",
    "location_id": 2840,
    "language_id": 1000
  }
}
```

For POST/PUT/PATCH tools, top-level non-path params are sent as JSON body unless `body` is provided.
