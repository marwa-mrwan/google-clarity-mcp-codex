# Marketing Intelligence MCP

Marketing Intelligence MCP is a local marketing analysis workspace that connects Google Search Console, GA4, Google Ads, Microsoft Clarity, and Mangools to strategy skills for SEO, paid media, and campaign planning.

Use this workspace as the routing layer for marketing analysis. Prefer the local MCP tools when available, then synthesize the findings into a practical action plan.

## Tool Routing

- Site health and SEO performance: use `gsc_list_sites`, `gsc_performance`, `gsc_inspect_url`, `gsc_sitemaps`, and `psi_audit_url`.
- Analytics traffic and conversions: use `ga4_list_properties`, `ga4_run_report`, and `ga4_realtime`.
- Google Ads audits: use `ads_list_accounts`, `ads_list_campaigns`, `ads_keyword_performance`, `ads_search_terms`, `ads_campaign_search_terms`, `ads_account_performance`, `ads_gaql_query`, and `ads_deep_report`.
- Keyword research: use `kwfinder_related_keywords`, `kwfinder_competitor_keywords`, `kwfinder_keyword_details`, `kwfinder_trends`, `kwfinder_gap_analysis`, and `serpchecker_serps`.
- Backlinks and competitors: use `linkminer_links`, `siteprofiler_overview`, `siteprofiler_backlink_profile`, `siteprofiler_top_content`, and `siteprofiler_competitors`.
- UX friction and behavior: use `clarity_prepare_request`, `clarity_live_insights`, `clarity_metric_summary`, `clarity_analyze_project`, and `clarity_compare_projects`.

## Strategy Skills

- `seo-strategist`: organic search, technical SEO, content, cannibalization, SXO, GEO/AI search, GSC/GA4/Clarity/Mangools synthesis.
- `google-ads-strategist`: Google Ads planning, diagnosis, bidding, keywords, conversion tracking, landing-page readiness, and client reports.
- `paid-ads-strategist`: multi-platform paid media strategy, Meta/Google/TikTok/LinkedIn channel mix, tracking, creative, budget allocation, and campaign launch planning.

## Workflow

1. Clarify the target site, country, language, date range, and business goal only if missing.
2. Start with cheap discovery calls such as list/configured-properties/options before spending API quota.
3. For vague requests, plan the MCP calls first, then run the smallest set that answers the question.
4. Pick the right strategy skill, then use MCP tools as evidence.
5. Group findings by impact: blocking issues, growth opportunities, and monitoring items.
6. Always end with concrete next actions, including the exact tool/source behind each recommendation.

## Local Account Mapping

Keep per-client IDs and tokens in `.vscode/marketing.accounts.local.json`. This file is ignored by Git and can be edited whenever accounts are added or tokens change.

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

The Google MCP server uses `analytics_property_id`. The Clarity MCP server uses `clarity_token`. Both can match accounts by `name`, `label`, or website where the tool supports it.

To migrate from an existing GA4 properties file and an old env file with `CLARITY_PROJECTS_JSON_BASE64`, run:

```bash
node scripts/build-marketing-accounts.mjs \
  --analytics /path/to/google.analytics.properties.local.json \
  --env /path/to/mcp.local.env
```

## Output Style

- Keep the answer business-focused, not API-focused.
- Mention missing credentials or inaccessible accounts plainly.
- For audits, include priority, evidence, and recommended action.
- For keyword research, include intent, difficulty, opportunity, and suggested content angle.
