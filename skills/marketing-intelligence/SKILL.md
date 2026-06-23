---
name: marketing-intelligence
description: Use when the user asks to analyze a website, check Google Search Console, audit Google Ads, review PageSpeed or GA4, inspect Microsoft Clarity behavior, or do Mangools keyword research.
---

# Marketing Intelligence MCP

Use this skill as the routing layer for Marketing Intelligence MCP. Prefer the local MCP tools when available, then synthesize the findings into a practical action plan.

## Tool Routing

- Site health and SEO performance: use `gsc_list_sites`, `gsc_performance`, `gsc_inspect_url`, `gsc_sitemaps`, `gsc_submit_sitemap`, `gsc_delete_sitemap`, and `psi_audit_url`.
- Analytics traffic and conversions: use `ga4_list_properties`, `ga4_run_report`, and `ga4_realtime`.
- Google Ads audits: use `ads_list_accounts`, `ads_account_hierarchy`, `ads_customer_details`, `ads_list_campaigns`, `ads_list_ads`, `ads_campaign_full_audit`, `ads_ad_group_full_audit`, `ads_keyword_performance`, `ads_search_terms`, `ads_campaign_search_terms`, `ads_account_performance`, `ads_gaql_query`, and `ads_deep_report`.
- Keyword research: use `kwfinder_related_keywords`, `kwfinder_competitor_keywords`, `kwfinder_keyword_details`, `kwfinder_trends`, `kwfinder_gap_analysis`, and `serpchecker_serps`.
- Backlinks and competitors: use `linkminer_links`, `siteprofiler_overview`, `siteprofiler_backlink_profile`, `siteprofiler_top_content`, and `siteprofiler_competitors`.
- UX friction and behavior: use `clarity_prepare_request`, `clarity_live_insights`, `clarity_metric_summary`, `clarity_analyze_project`, and `clarity_compare_projects`.

## Strategy Routing

- Use `seo-strategist` for organic search strategy, technical SEO, content strategy, cannibalization, SXO, GEO/AI-search visibility, and Search Console-led recommendations.
- Use `paid-ads-strategist` as the main umbrella for paid media: Google, Meta, TikTok, LinkedIn, Microsoft, YouTube, creative strategy, tracking/attribution, budget allocation, and channel mix. For medical, healthcare, cosmetic clinic, pharmacy, supplements, telemedicine, fertility, addiction, or clinical-trial work, require a Google policy check before final copy, targeting, or campaign recommendations.
- Use `google-ads-strategist` as a supporting deep Google Ads reference when the user needs Google-only launch planning, bidding, keywords, account diagnosis, or client reporting. Do not ask the user to call it separately when `paid-ads-strategist` can load the supporting references.
- For campaign planning, combine sources in this order: tracking health, business goal, landing page readiness, search intent, paid demand, creative angles, budget rules.

## Workflow

1. Clarify the target site, country, language, date range, and business goal only if missing.
2. Inspect local workspace context before declaring missing data: read any user-mentioned file paths, check likely folders such as `reports/`, `.vscode/`, `exports/`, `downloads/`, and use `rg --files` to locate relevant report/export files.
3. Start with cheap discovery calls such as list/configured-properties/options before spending API quota.
4. For vague requests, plan the MCP calls first, then run the smallest set that answers the question.
5. Choose the strategy skill based on the user's goal, then use MCP tools as evidence.
6. Group findings by impact: blocking issues, growth opportunities, and monitoring items.
7. Always end with concrete next actions, including the exact tool/source behind each recommendation.

## Local Context Rules

- Open editor tabs and file paths in the prompt are not automatically evidence. If a relevant path is visible or mentioned, read it before analysis.
- Local account mapping files such as `.vscode/marketing.accounts.local.json` mean IDs/tokens may be configured locally; do not claim GSC/GA4/Ads/Clarity is unavailable until you have checked tool access or the relevant local config. Do not print secrets.
- Local reports or exports under `reports/` count as evidence. Use them when MCP/API calls are unavailable, rate-limited, or not needed.
- Distinguish clearly between `not checked`, `checked but unavailable`, `tool failed`, and `not configured`.
- In `Data Gaps`, never write "no access" unless a connector/file check actually failed. Prefer precise language such as "لم أستخدم GSC في هذا التحليل" or "فشل PageSpeed بسبب 429".
- Search Console sitemap changes are possible through `gsc_submit_sitemap` and `gsc_delete_sitemap` when OAuth includes the full `webmasters` scope. Deletions must be explicitly requested and confirmed; otherwise recommend a manual UI fallback.

## Minimum Evidence Packs

Use these packs unless the user asks for a very small check.

- SEO site audit: GSC performance/pages, GSC index/sitemaps when available, PageSpeed, Mangools overview/backlinks/keywords, Clarity behavior for key pages, GA4 landing/conversion data when available, and rendered DOM/Chrome DevTools when a page-level technical issue is suspected.
- Google Ads audit: `ads_account_hierarchy`, `ads_customer_details`, `ads_list_campaigns`, `ads_list_ads`, `ads_campaign_full_audit` for priority campaigns, `ads_ad_group_full_audit` for priority ad groups, `ads_search_terms`, `ads_campaign_search_terms`, `ads_keyword_performance`, conversion/recommendation/budget/asset deep reports, GA4 landing/conversion data, and Clarity landing page friction when available. For medical/healthcare accounts, also check current official Google Ads policy sources or clearly mark the live policy check as `not checked`.
- Paid/organic overlap: combine Ads search terms/cost/conversions, GSC queries/pages, GA4 landing conversions, Mangools keyword difficulty/competitors, and landing page readiness.

If a connector is missing or a report fails, explicitly list it under `Data Gaps` and explain how it limits confidence. Also list available local files that were used or intentionally not used.

For Google Ads audits, automatically include creative/copy, tracking, and targeting checks:
- Ad copy: RSA headlines/descriptions, pinning when visible, paths, final URLs, policy status, ad strength/asset coverage when available, offer clarity, keyword-to-ad relevance, CTA, Arabic/local-market phrasing, claim risk, and duplication across ad groups.
- Scripts/copy proposals: if copy, landing page, or funnel messaging is weak, provide ready-to-use ad copy variations and, when relevant, a short call/WhatsApp/video script with hook, proof, objection handling, and CTA.
- Tracking/UTM: check final URLs, tracking template, final URL suffix, auto-tagging/GCLID, missing or inconsistent UTMs, landing-page query preservation, and GA4/source-medium consistency when available.
- Targeting reports: audiences/segments, locations, devices, ad schedule, demographics, search terms, negatives, auction insights, budget/impression-share loss, assets/extensions, conversion goals, recommendations, and change history.
- Medical policy: include policy status, date checked, official source/check-log status, risky claims, safer wording, and audience/targeting constraints before recommending medical ad copy or targeting changes.

## Output Style

- Keep the answer business-focused, not API-focused.
- Mention missing credentials or inaccessible accounts plainly.
- For audits, do not stop at short issue bullets. Every important issue must explain: what is wrong, where it appears, why it matters, likely root cause, evidence/source, business impact, exact fix, owner/dependency, priority, and how to verify success.
- For keyword research, include intent, difficulty, opportunity, and suggested content angle.

## Deep Analysis Format

For SEO, Ads, or combined audits, use this structure unless the user asks for a shorter answer:

1. Executive Snapshot: overall health, biggest risk, fastest win, confidence level, and data gaps.
2. Evidence Used: tools/files checked and date range.
3. Critical Issues: detailed diagnosis, not just symptoms.
4. Opportunity Backlog: growth ideas ranked by impact/effort.
5. Action Plan: 7 days, 14 days, 30 days, 60-90 days.
6. Measurement Plan: KPI, baseline, target, verification tool, owner.
7. Open Questions: only the questions that materially change the plan.
