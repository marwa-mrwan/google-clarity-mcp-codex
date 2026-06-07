name: marketing-intelligence
description: Use when the user asks to analyze a website, check Google Search Console, audit Google Ads, review PageSpeed or GA4, inspect Microsoft Clarity behavior, or do Mangools keyword research.
---

# Marketing Intelligence

Use this skill as the routing layer for Marwa Marketing MCP. Prefer the local MCP tools when available, then synthesize the findings into a practical action plan.

## Tool Routing

- Site health and SEO performance: use `gsc_list_sites`, `gsc_performance`, `gsc_inspect_url`, `gsc_sitemaps`, and `psi_audit_url`.
- Analytics traffic and conversions: use `ga4_list_properties`, `ga4_run_report`, and `ga4_realtime`.
- Google Ads audits: use `ads_list_accounts`, `ads_list_campaigns`, `ads_keyword_performance`, `ads_search_terms`, `ads_campaign_search_terms`, `ads_account_performance`, `ads_gaql_query`, and `ads_deep_report`.
- Keyword research: use `kwfinder_related_keywords`, `kwfinder_competitor_keywords`, `kwfinder_keyword_details`, `kwfinder_trends`, `kwfinder_gap_analysis`, and `serpchecker_serps`.
- Backlinks and competitors: use `linkminer_links`, `siteprofiler_overview`, `siteprofiler_backlink_profile`, `siteprofiler_top_content`, and `siteprofiler_competitors`.
- UX friction and behavior: use `clarity_prepare_request`, `clarity_live_insights`, `clarity_metric_summary`, `clarity_analyze_project`, and `clarity_compare_projects`.

## Workflow

1. Clarify the target site, country, language, date range, and business goal only if missing.
2. Start with cheap discovery calls such as list/configured-properties/options before spending API quota.
3. For vague requests, plan the MCP calls first, then run the smallest set that answers the question.
4. Group findings by impact: blocking issues, growth opportunities, and monitoring items.
5. Always end with concrete next actions, including the exact tool/source behind each recommendation.

## Output Style

- Keep the answer business-focused, not API-focused.
- Mention missing credentials or inaccessible accounts plainly.
- For audits, include priority, evidence, and recommended action.
- For keyword research, include intent, difficulty, opportunity, and suggested content angle.
