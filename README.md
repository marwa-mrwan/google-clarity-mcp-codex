# google-clarity-mangools-mcp-codex

google-clarity-mangools-mcp-codex is a local marketing analysis workspace for Codex. It exposes 281 tools across three MCP servers for Google marketing products, Microsoft Clarity, and Mangools.

Use this repo as the local MCP layer. Keep secrets and client account IDs in local ignored files, then let separate Codex skills use the MCP tools as evidence for audits, reports, and campaign strategy.

## What Is Included

- `google-mcp`: 191 tools for Google Search Console, GA4, Google Ads, Google Tag Manager, Google Business Profile, Merchant Center, PageSpeed Insights, and combined reports.
- `clarity-mcp`: 8 tools for Microsoft Clarity project lookup, live insights, metrics, comparisons, and project analysis.
- `mangools-mcp`: 82 tools for KWFinder, SERPChecker, LinkMiner, SiteProfiler, SERPWatcher, and AIWatcher research.
- `scripts/`: setup and migration helpers for local account mapping.

## Exact Tool Inventory

| MCP server / service | Tools | Included capabilities |
| --- | ---: | --- |
| Google Search Console | 10 | Sites, performance, URL inspection, sitemaps, and site/sitemap management. |
| Google Analytics 4 | 21 | Properties, standard/batch/pivot/realtime reports, metadata, compatibility, audits, and Admin API access. |
| Google Ads | 54 | Multi-MCC discovery and routing, campaigns, ad groups, ads, keywords, search terms, reporting, audits, recommendations, assets, conversions, billing diagnostics, and guarded mutations. |
| Google Tag Manager | 22 | Accounts, containers, workspaces, tags, triggers, variables, versions, publishing, permissions, and generic API access. |
| Google Business Profile | 44 | Accounts, locations, reviews/replies, posts, media, Q&A, verification, categories, attributes, notifications, action links, lodging, calls, performance, and guarded CRUD. |
| Google Merchant Center | 38 | Accounts/subaccounts, products and product inputs, data sources, promotions, inventory, conversion sources, reports, issues, quotas, and guarded CRUD. |
| PageSpeed Insights | 1 | Lighthouse/PageSpeed audit for a URL. |
| Combined Google reporting | 1 | Cross-channel marketing report. |
| Microsoft Clarity | 8 | Project discovery, request preparation, live insights, summaries, project analysis, and comparisons. |
| Mangools | 82 | Keyword research, SERPs, backlinks, domain/competitor analysis, rank tracking, and AI visibility research. |
| **Total** | **281** | Three local stdio MCP servers. |

## Tool Routing

- Site health and SEO performance: `gsc_list_sites`, `gsc_performance`, `gsc_inspect_url`, `gsc_sitemaps`, `gsc_get_sitemap`, `gsc_submit_sitemap`, `gsc_delete_sitemap`, `gsc_get_site`, `gsc_add_site`, `gsc_delete_site`, `psi_audit_url`.
- Analytics traffic and conversions: `ga4_list_properties`, `ga4_run_report`, `ga4_batch_run_reports`, `ga4_pivot_report`, `ga4_metadata`, `ga4_check_compatibility`, `ga4_realtime`, `ga4_property_audit`, and `ga4_admin_api_call`.
- Google Ads audits: `ads_discover_accounts`, `ads_list_accounts`, `ads_list_client_accounts`, `ads_list_campaigns`, `ads_keyword_performance`, `ads_search_terms`, `ads_campaign_search_terms`, `ads_account_performance`, `ads_gaql_query`, `ads_deep_report`, `ads_field_metadata`, `ads_validate_gaql`, `ads_policy_summary`, and the full audit tools.
- Business Profile operations: `gbp_list_accounts`, location CRUD, reviews/replies, local posts, media, Q&A, verification, notifications, place-action links, lodging, performance, and `gbp_api_call` for the remaining official endpoints.
- Merchant Center operations: account/subaccount access, product inputs, processed products, feeds/data sources, promotions, inventory, conversions, reports, issue resolution, quotas, and `merchant_api_call` for the remaining official endpoints.
- Keyword research: `kwfinder_related_keywords`, `kwfinder_competitor_keywords`, `kwfinder_keyword_details`, `kwfinder_trends`, `kwfinder_gap_analysis`, `serpchecker_serps`.
- Backlinks and competitors: `linkminer_links`, `siteprofiler_overview`, `siteprofiler_backlink_profile`, `siteprofiler_top_content`, `siteprofiler_competitors`.
- UX friction and behavior: `clarity_prepare_request`, `clarity_live_insights`, `clarity_metric_summary`, `clarity_analyze_project`, `clarity_compare_projects`.

## Related Strategy Skills

The strategy skills are maintained separately from this MCP repo so they can be reused across projects through `~/.codex/skills`:

- [`marketing-intelligence`](https://github.com/marwa-mrwan/marketing-intelligence): main router for deciding which MCP tools and strategy skill should be used.
- [`seo-strategist`](https://github.com/marwa-mrwan/seo-strategist): organic search, technical SEO, content, cannibalization, ecommerce SEO, local SEO, schema, hreflang, SXO, GSC, GA4, Clarity, and Mangools synthesis.
- [`seo-report-sheet-builder`](https://github.com/marwa-mrwan/seo-report-sheet-builder): turns a completed technical SEO audit into a structured Google Sheets action plan with separated issue tabs, checklist columns, and non-duplicated recommendations.
- [`google-ads-strategist`](https://github.com/marwa-mrwan/google-ads-strategist): Google Ads planning, Search, PMax, Demand Gen, YouTube, diagnosis, bidding, keywords, conversion tracking, creative/copy, landing page readiness, and client reports.

Install or update them by copying each skill folder into `~/.codex/skills/`, then restart Codex so the session reloads the skill list.

## Local Files

These files live in `.vscode/` and are intentionally ignored by Git:

- `.vscode/mcp.local.env`: local environment variables and API credentials.
- `.vscode/google.tokens.local.json`: Google OAuth token file generated by `npm run auth`.
- `.vscode/marketing.accounts.local.json`: per-client website, GA4 property ID, and Clarity token mapping.
- `.vscode/mcp.json`: local MCP server configuration for VS Code compatible clients.

Do not commit local token, credential, account, or `.env` files.

## Quick Start

Clone the repo and install dependencies:

```bash
git clone https://github.com/marwa-mrwan/google-clarity-mangools-mcp-codex.git
cd google-clarity-mangools-mcp-codex

cd google-mcp && npm install
cd ../clarity-mcp && npm install
cd ../mangools-mcp && npm install
cd ..
```

Create `.vscode/mcp.local.env`:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_ADS_DEVELOPER_TOKEN=...
GOOGLE_ADS_LOGIN_CUSTOMER_IDS=1234567890,9876543210
GOOGLE_ADS_API_VERSION=v24
GOOGLE_ADS_ENABLE_MUTATIONS=false
GOOGLE_ADS_MUTATION_CUSTOMER_IDS=
GBP_ENABLE_MUTATIONS=false
MERCHANT_ENABLE_MUTATIONS=false
GOOGLE_TOKEN_FILE=../.vscode/google.tokens.local.json
MANGOOLS_API_KEY=...
MARKETING_ACCOUNTS_FILE=../.vscode/marketing.accounts.local.json
```

`GOOGLE_ADS_API_VERSION` is optional. If it is omitted, the Google MCP server tries supported Google Ads API versions automatically, starting with the newest configured version.

Run Google OAuth once:

```bash
cd google-mcp
npm run auth
```

The OAuth flow saves tokens to the path from `GOOGLE_TOKEN_FILE`.

## Google Token File Example

`.vscode/google.tokens.local.json` is generated locally and ignored by Git. Its shape should look like this:

```json
{
  "access_token": "ACCESS_TOKEN_PLACEHOLDER",
  "refresh_token": "REFRESH_TOKEN_PLACEHOLDER",
  "scope": "openid https://www.googleapis.com/auth/webmasters https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/analytics.edit https://www.googleapis.com/auth/analytics.manage.users https://www.googleapis.com/auth/tagmanager.readonly https://www.googleapis.com/auth/tagmanager.edit.containers https://www.googleapis.com/auth/tagmanager.delete.containers https://www.googleapis.com/auth/tagmanager.edit.containerversions https://www.googleapis.com/auth/tagmanager.publish https://www.googleapis.com/auth/tagmanager.manage.users https://www.googleapis.com/auth/tagmanager.manage.accounts https://www.googleapis.com/auth/adwords https://www.googleapis.com/auth/business.manage https://www.googleapis.com/auth/content",
  "token_type": "Bearer",
  "expiry_date": 1760000000000
}
```

The important field for long-term access is `refresh_token`. If scopes are missing or Google tools stop authorizing, rerun `npm run auth` from `google-mcp`. Sitemap submit/delete needs the full Search Console scope `https://www.googleapis.com/auth/webmasters`; GA4 write/remove helpers need `analytics.edit`; GTM write/remove/publish helpers need the relevant `tagmanager.*` scopes. Older tokens with read-only scopes can list/report data but cannot make changes.

## Local Account Mapping

Keep per-client IDs and tokens in `.vscode/marketing.accounts.local.json`. This file is ignored by Git and can be edited whenever accounts are added or tokens change.

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

The Google MCP server uses `analytics_property_id`. The Clarity MCP server uses `clarity_token`. Both can match accounts by `name`, `label`, or `website` where the tool supports it.

To add a new client, add one object to `accounts` with:

- `name`: stable lowercase key, useful for tool calls.
- `label`: display name for the client.
- `website`: canonical website URL.
- `analytics_property_id`: GA4 property ID for that client.
- `clarity_token`: Microsoft Clarity Data Export API token for that client.

## Migrating Existing Files

To migrate from an existing GA4 properties file and an old env file with `CLARITY_PROJECTS_JSON_BASE64`, run:

```bash
node scripts/build-marketing-accounts.mjs \
  --analytics /path/to/legacy-ga4-properties.json \
  --env /path/to/mcp.local.env
```

Then review `.vscode/marketing.accounts.local.json` manually and keep the old env value only if you still need legacy Clarity configuration.

## Verify MCP Servers

Run this after setup or after pulling updates:

```bash
node scripts/verify-mcp-servers.mjs
```

Expected result:

```text
google-marketing-suite: 191 tools
microsoft-clarity: 8 tools
mangools: 82 tools
```

The verification script exits after printing the registry counts. Restart Codex or reload the VS Code MCP session after pulling changes so the updated tool registry appears.

To test Google Ads access without printing account names or secrets:

```bash
cd google-mcp
node --input-type=module -e "import dotenv from 'dotenv'; dotenv.config({path:'../.vscode/mcp.local.env'}); process.env.GOOGLE_TOKEN_FILE='../.vscode/google.tokens.local.json'; const {getAuthenticatedClient}=await import('./lib/google-auth.js'); const {handleAdsTool}=await import('./lib/ads.js'); const authClient=await getAuthenticatedClient(); const accounts=await handleAdsTool('ads_list_accounts', {}, authClient); console.log('ads accounts ok:', Array.isArray(accounts) ? accounts.length : 'non-array');"
```

## Workflow

1. Clarify the target site, country, language, date range, and business goal only if missing.
2. Start with cheap discovery calls such as list/configured-properties/options before spending API quota.
3. For vague requests, plan the MCP calls first, then run the smallest set that answers the question.
4. Pick the right strategy skill, then use MCP tools as evidence.
5. Group findings by impact: blocking issues, growth opportunities, and monitoring items.
6. Always end with concrete next actions, including the exact tool/source behind each recommendation.

## Output Style

- Keep the answer business-focused, not API-focused.
- Mention missing credentials or inaccessible accounts plainly.
- For audits, include priority, evidence, and recommended action.
- For keyword research, include intent, difficulty, opportunity, and suggested content angle.
