# google-clarity-mcp-codex

Local MCP workspace for Google marketing products and Microsoft Clarity.

The workspace exposes **219 tools** through two local stdio MCP servers. Credentials, OAuth tokens, API keys, and client account mappings stay in ignored local files.

## What Is Included

- `google-mcp`: **211 tools** for Search Console, GA4, Google Ads, Google Tag Manager, Google Business Profile, and Merchant Center.
- `clarity-mcp`: **8 tools** for Microsoft Clarity project discovery, live insights, summaries, analysis, and comparisons.
- `scripts/`: setup, verification, local plugin installation, and account-mapping helpers.

## Exact Tool Inventory

| MCP server / service | Tools | Included capabilities |
| --- | ---: | --- |
| Google Search Console | 10 | Sites, performance, URL inspection, sitemaps, and guarded site/sitemap management. |
| Google Analytics 4 | 21 | Properties, standard/batch/pivot/realtime reports, metadata, compatibility, audits, and Admin API access. |
| Google Ads | 76 | Multi-MCC discovery/routing, account hierarchy, campaigns, ad groups, ads, keywords, audiences, assets, targeting, reports, audits, recommendations, conversions, and guarded mutations. |
| Google Tag Manager | 22 | Accounts, containers, workspaces, tags, triggers, variables, versions, publishing, permissions, and generic API access. |
| Google Business Profile | 44 | Accounts, locations, reviews/replies, posts, media, Q&A, verification, categories, attributes, notifications, action links, lodging, calls, performance, and guarded CRUD. |
| Google Merchant Center | 38 | Accounts/subaccounts, products/product inputs, data sources, promotions, inventory, conversions, reports, issues, quotas, and guarded CRUD. |
| **Google server total** | **211** | One `google-marketing-suite` MCP server. |
| Microsoft Clarity | 8 | Project discovery, request preparation, live insights, summaries, project analysis, and comparisons. |
| **Repository total** | **219** | Two local stdio MCP servers. |

## Google Ads Multi-MCC

- `ads_discover_accounts` discovers the accounts and MCCs directly available to the OAuth user.
- MCC hierarchies are inspected and cached so each client account uses the correct `login-customer-id`.
- `GOOGLE_ADS_LOGIN_CUSTOMER_IDS` accepts multiple comma-, semicolon-, or space-separated MCC IDs.
- The legacy `GOOGLE_ADS_LOGIN_CUSTOMER_ID` variable remains supported.
- Every customer-scoped Ads tool accepts an optional `login_customer_id` override.

Write tools are restricted to customer IDs explicitly listed in `GOOGLE_ADS_MUTATION_CUSTOMER_IDS`. Use `dry_run=true` when you only want a preview.

## Google Business Profile

The 44 tools cover account and location discovery, location CRUD, reviews and replies, posts, media, Q&A, verification, categories, attributes, notifications, place-action links, lodging, calls, and performance.

`gbp_api_call` covers documented endpoints that do not have a named tool and only accepts predefined Google API service hosts. Writes require `GBP_ENABLE_MUTATIONS=true`, `confirm=true`, and `dry_run=false`.

## Google Merchant Center

The 38 tools cover accounts/subaccounts, product inputs and processed products, data sources, promotions, local/regional inventory, conversion sources, reports, account/product issues, and quotas.

`merchant_api_call` covers documented endpoints that do not have a named tool and only accepts predefined Merchant API service hosts. Writes require `MERCHANT_ENABLE_MUTATIONS=true`, `confirm=true`, and `dry_run=false`.

See [`docs/google-business-profile-merchant-api.md`](docs/google-business-profile-merchant-api.md) for supported service families, safety behavior, and official API references.

## Local Files and Secrets

The following files are local and ignored by Git:

- `.vscode/mcp.local.env`: credentials and API keys.
- `.vscode/google.tokens.local.json`: generated Google OAuth tokens.
- `.vscode/marketing.accounts.local.json`: website, GA4 property, and Clarity account mappings.
- Any `.env`, credential, secret, or token JSON file matched by `.gitignore`.

Never commit access tokens, refresh tokens, OAuth client secrets, developer tokens, Clarity tokens, or client account exports.

## Quick Start

```bash
git clone https://github.com/marwa-mrwan/google-clarity-mcp-codex.git
cd google-clarity-mcp-codex

cd google-mcp && npm install
cd ../clarity-mcp && npm install
cd ..
```

Create `.vscode/mcp.local.env`:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_ADS_DEVELOPER_TOKEN=...
GOOGLE_ADS_LOGIN_CUSTOMER_IDS=1234567890,9876543210
GOOGLE_ADS_API_VERSION=v24
GOOGLE_ADS_MUTATION_CUSTOMER_IDS=
GBP_ENABLE_MUTATIONS=false
MERCHANT_ENABLE_MUTATIONS=false
GOOGLE_TOKEN_FILE=../.vscode/google.tokens.local.json
MARKETING_ACCOUNTS_FILE=../.vscode/marketing.accounts.local.json
```

Run Google OAuth once:

```bash
cd google-mcp
npm run auth
```

The OAuth token file is written to `GOOGLE_TOKEN_FILE`. If you add new Google scopes, rerun the auth command so the refresh token includes them.

## Local Account Mapping

Keep per-client IDs and Clarity tokens in `.vscode/marketing.accounts.local.json`:

```json
{
  "accounts": [
    {
      "name": "example_account",
      "label": "Example Account",
      "website": "https://example.com/",
      "analytics_property_id": "GA4_PROPERTY_ID_PLACEHOLDER",
      "clarity_token": "CLARITY_DATA_EXPORT_TOKEN_PLACEHOLDER"
    }
  ]
}
```

## Verification

```bash
node scripts/verify-mcp-servers.mjs
```

Expected output:

```text
google-marketing-suite: 211 tools
microsoft-clarity: 8 tools
```

Run the Google safety and MCP protocol tests:

```bash
cd google-mcp
npm test
```

## Security

- GitHub Actions runs dependency installation, tests, MCP registry verification, and secret-pattern checks.
- `main` is protected against deletion and force pushes.
- Pull requests must pass the configured CI check before merge.
- Workflow permissions are read-only unless a future workflow explicitly needs more.
- Dependency alerts and automated security updates are enabled on GitHub.

Report a security problem privately using the process in [`SECURITY.md`](SECURITY.md); do not open a public issue containing credentials or exploit details.

## Related Repositories

- [`mangools-mcp`](https://github.com/marwa-mrwan/mangools-mcp): standalone KWFinder, SERPChecker, SERPWatcher, LinkMiner, SiteProfiler, and AIWatcher MCP server.
- [`marketing-intelligence`](https://github.com/marwa-mrwan/marketing-intelligence): routing and synthesis across marketing data sources.
- [`seo-strategist`](https://github.com/marwa-mrwan/seo-strategist): SEO, local SEO, analytics, content, and technical strategy.
- [`seo-report-sheet-builder`](https://github.com/marwa-mrwan/seo-report-sheet-builder): structured SEO execution workbooks.
- [`google-ads-strategist`](https://github.com/marwa-mrwan/google-ads-strategist): Google Ads planning, audits, optimization, and reporting.
