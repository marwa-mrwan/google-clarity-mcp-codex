# Google Marketing Suite MCP for Codex

This folder is now shaped as a Codex local plugin.

It exposes one MCP server, `google-marketing-suite`, with tools for:

- Google Search Console
- Google Analytics 4
- Google Ads
- Google Business Profile
- Google Merchant Center
- Google PageSpeed Insights
- Google Tag Manager

Current registry: **191 tools** — Search Console 10, GA4 21, Google Ads 54, Tag Manager 22, Business Profile 44, Merchant Center 38, PageSpeed 1, and combined reporting 1.

GA4, Search Console, and GTM include named read tools for common audits plus advanced API-call helpers for missing official API functions:

- `ga4_admin_api_call`: GA4 Admin API create/update/delete/archive calls. Non-GET requires `confirm=true`.
- `gtm_api_call`: GTM API create/update/delete/publish calls. Non-GET requires `confirm=true`.
- Search Console write/remove tools such as `gsc_submit_sitemap`, `gsc_delete_sitemap`, `gsc_add_site`, and `gsc_delete_site` require explicit confirmation where the action changes account state.

## Google Ads Tools

For the full MCC setup, OAuth requirements, `login-customer-id` rules, access checks, and MCP validation flow, see:

- [`../docs/google-ads-mcc-mcp-integration.md`](../docs/google-ads-mcc-mcp-integration.md)
- [`../docs/google-ads-missing-capabilities.md`](../docs/google-ads-missing-capabilities.md)

The Ads tools include account, campaign, ad group, ad, keyword, and keyword idea access:

- `ads_list_accounts`
- `ads_list_client_accounts`
- `ads_list_campaigns`
- `ads_list_ad_groups`
- `ads_list_ads`
- `ads_search_terms`
- `ads_campaign_search_terms`
- `ads_keyword_performance`
- `ads_keyword_ideas`
- `ads_keyword_historical_metrics`
- `ads_account_performance`
- `ads_gaql_query`
- `ads_deep_report`
- `ads_account_hierarchy`
- `ads_customer_details`
- `ads_campaign_full_audit`
- `ads_ad_group_full_audit`
- `ads_field_metadata`
- `ads_validate_gaql`
- `ads_policy_summary`
- `ads_conversion_action_full_audit`
- `ads_access_audit`
- `ads_shared_sets_audit`
- `ads_experiment_full_audit`
- `ads_change_summary`
- `ads_asset_group_full_audit`
- `ads_billing_summary`

Use `ads_list_ads` when you need actual ad creative text such as responsive search ad headlines and descriptions, expanded text ad copy, final URLs, paths, statuses, and performance metrics. Use `ads_list_ad_groups` when you need the campaign > ad group structure with metrics.

Use `ads_gaql_query` for any advanced read-only GAQL report that is not covered by a dedicated tool. Use `ads_deep_report` for common analysis reports: devices, geo/user locations, landing pages, demographics, campaign budgets, conversion actions, recommendations, change history, negative keywords, assets, Performance Max asset groups, and Shopping products.

### Advanced Read Reports

| Tool/report | Use |
| --- | --- |
| `ads_account_hierarchy` | Recursively read MCC manager/client hierarchy. |
| `ads_customer_details` | Customer metadata, labels, user access summaries, and conversion goal sections. |
| `ads_campaign_full_audit` | Multi-section campaign audit: settings, budget, bidding, targeting, assets, goals, recommendations, and performance. |
| `ads_ad_group_full_audit` | Multi-section ad group audit: keywords, negatives, audiences, placements, topics, ads, assets, and performance. |
| `ads_deep_report` | Use `report_type` for specific advanced reports. |
| `ads_field_metadata` | Search Google Ads API field metadata before writing custom GAQL. |
| `ads_validate_gaql` | Validate read-only GAQL before running a report. |
| `ads_policy_summary` | Ad approval/review status and policy topic entries. |
| `ads_conversion_action_full_audit` | Conversion actions plus customer/campaign conversion goals. |
| `ads_access_audit` | User access, invitations, labels, and account metadata. |
| `ads_shared_sets_audit` | Shared negative keyword sets and members. |
| `ads_experiment_full_audit` | Experiments, arms, and experiment campaigns. |
| `ads_change_summary` | Change events grouped by user/resource/client type. |
| `ads_asset_group_full_audit` | Performance Max asset groups, assets, listings, and search terms. |
| `ads_billing_summary` | Billing setup read-only diagnostics where allowed. |

New `ads_deep_report` report types include: `customer_labels`, `customer_user_access`, `customer_user_access_invitations`, `campaign_settings`, `bidding_strategies`, `campaign_conversion_goals`, `customer_conversion_goals`, `campaign_labels`, `ad_group_labels`, `keyword_quality`, `device_bid_modifiers`, `placements`, `topics`, `campaign_asset_links`, `ad_group_asset_links`, `customer_asset_links`, `asset_details`, `pmax_listing_groups`, `pmax_search_terms`, `shopping_listing_groups`, `demand_gen_campaigns`, and `video_campaigns`.

### Safe Write Tools

Write tools are available but blocked by default. Every write tool defaults to `dry_run=true` and returns a preview without calling Google Ads mutate endpoints.

| Tool | Purpose |
| --- | --- |
| `ads_pause_campaign`, `ads_enable_campaign` | Change campaign status. |
| `ads_create_campaign_budget` | Create a campaign budget. |
| `ads_update_campaign_budget` | Update a campaign budget amount. |
| `ads_update_campaign_dates` | Update campaign start/end date. |
| `ads_update_campaign_bidding`, `ads_update_target_cpa`, `ads_update_target_roas` | Update campaign bidding settings. |
| `ads_add_campaign_negative_keywords`, `ads_add_ad_group_negative_keywords` | Add negative keywords. |
| `ads_add_keywords`, `ads_pause_keywords`, `ads_enable_keywords`, `ads_update_keyword_bid` | Manage ad group keywords. |
| `ads_pause_ad`, `ads_enable_ad`, `ads_create_responsive_search_ad`, `ads_update_responsive_search_ad` | Manage ads. |
| `ads_create_ad_group`, `ads_create_search_campaign` | Create search structures from explicit inputs. |
| `ads_apply_recommendation`, `ads_dismiss_recommendation` | Apply or dismiss recommendations. |
| `ads_add_sitelink_asset`, `ads_link_asset_to_campaign` | Create/link sitelink assets. |
| `ads_upload_offline_conversion` | Upload click conversions with explicit conversion payloads. |
| `ads_mutate_operations` | Advanced create/update helper for raw Google Ads mutate operations. It rejects any `remove` operation. |

To execute any mutation, all safety checks must pass:

1. `GOOGLE_ADS_ENABLE_MUTATIONS=true`
2. `GOOGLE_ADS_MUTATION_CUSTOMER_IDS` includes the target `customer_id`
3. Tool argument `confirm=true`
4. Tool argument `dry_run=false`

Optional `validate_only=true` asks Google Ads to validate the request without applying it after the guardrails pass.

Do not use Google Ads remove/delete operations by default. This MCP intentionally supports create/update/status changes and rejects raw remove operations in `ads_mutate_operations`.

For remarketing and retargeting analysis, use `ads_deep_report` with:

- `user_lists`
- `custom_audiences`
- `campaign_audience_targets`
- `ad_group_audience_targets`
- `campaign_audience_performance`
- `ad_group_audience_performance`
- `webpage_targets`

For negative keyword and competitor analysis, use:

- `campaign_negative_keywords`
- `ad_group_negative_keywords`
- `shared_negative_keyword_sets`
- `negative_keyword_list_members`
- `negative_keyword_candidates`
- `auction_insights_campaign`
- `auction_insights_keyword`

Auction Insights availability depends on Google Ads API permissions and whether auction insight metrics are available for the account/campaign.

For Responsive Search Ads, Dynamic Search Ads, and ad-variation style experiment analysis, use:

- `ads_list_ads`
- `dynamic_search_ads`
- `dynamic_search_targets`
- `webpage_targets`
- `experiments`
- `experiment_arms`
- `experiment_campaigns`

Google Ads exposes ad variations through the experiments surface in the API, so these reports provide read-only experiment and experiment-arm visibility rather than creating or editing variations.

For location targeting and schedule analysis, use:

- `targeted_location_performance`
- `location_targets`
- `excluded_locations`
- `proximity_targets`
- `ad_schedules`
- `day_of_week_performance`
- `hour_of_day_performance`

Use `targeted_location_performance` for the Google Ads "Targeted locations" table: readable city/district/governorate name, bid adjustment, clicks, impressions, CTR, average CPC, cost, conversions, conversion rate, and cost per conversion. `location_targets` and `excluded_locations` also resolve geo target IDs into readable names.

## Additional Tools

- Google Ads multi-MCC:
  - `ads_discover_accounts` discovers every directly accessible MCC/account and caches the correct `login-customer-id` route for each client.
  - `GOOGLE_ADS_LOGIN_CUSTOMER_IDS` accepts multiple comma-separated MCC IDs. The old singular variable remains supported.
  - Every customer-scoped Ads tool accepts an optional `login_customer_id` override.
- Business Profile (44 tools): account/location CRUD, reviews and replies, local posts, media, Q&A, verification, categories, attributes, notifications, place-action links, lodging, calls, and performance.
  - Use `gbp_api_call` for any documented endpoint not covered by a named tool. It only accepts predefined Google service hosts.
- Merchant Center (38 tools): accounts/subaccounts, products and product inputs, data sources, promotions, local/regional inventory, conversion sources, reports, issue resolution, and quotas.
  - Use `merchant_api_call` for any documented Merchant API endpoint not covered by a named tool. It only accepts predefined Google service hosts.
- Full setup and safety reference:
  - [`../docs/google-business-profile-merchant-api.md`](../docs/google-business-profile-merchant-api.md)
- PageSpeed Insights:
  - `psi_audit_url`
- Cross-channel reporting:
  - `marketing_full_report`

## Files Codex Uses

- `.codex-plugin/plugin.json` is the Codex plugin manifest.
- `.mcp.json` tells Codex how to start the local MCP server.
- `index.js` starts the MCP server over stdio.
- `.env` stores your Google OAuth and Ads credentials.

## Credentials

Keep these values in `.env`:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...
GOOGLE_ADS_DEVELOPER_TOKEN=...
GOOGLE_ADS_LOGIN_CUSTOMER_IDS=1234567890,9876543210
# Optional legacy/single-MCC fallback:
GOOGLE_ADS_LOGIN_CUSTOMER_ID=...
GOOGLE_ADS_API_VERSION=v24
GOOGLE_ADS_ENABLE_MUTATIONS=false
GOOGLE_ADS_MUTATION_CUSTOMER_IDS=
GBP_ENABLE_MUTATIONS=false
MERCHANT_ENABLE_MUTATIONS=false
```

`GOOGLE_ADS_DEVELOPER_TOKEN` is required for Ads. MCC IDs are optional because `ads_discover_accounts` can discover directly accessible MCCs from the OAuth user; configure the plural variable when you want explicit fallback routes.
`GOOGLE_ADS_API_VERSION` is optional; omit it to let the MCP try supported versions automatically.
`GOOGLE_ADS_ENABLE_MUTATIONS` defaults to disabled. Only add customer IDs to `GOOGLE_ADS_MUTATION_CUSTOMER_IDS` when you intentionally allow write tools for those accounts.
Business Profile and Merchant writes are also disabled by default. A write requires its service env flag, `confirm=true`, and `dry_run=false`.

After adding new Google scopes, rerun `npm run auth` so the refresh token includes:

- `https://www.googleapis.com/auth/webmasters`
- `https://www.googleapis.com/auth/analytics.edit`
- `https://www.googleapis.com/auth/analytics.manage.users`
- `https://www.googleapis.com/auth/tagmanager.edit.containers`
- `https://www.googleapis.com/auth/tagmanager.delete.containers`
- `https://www.googleapis.com/auth/tagmanager.edit.containerversions`
- `https://www.googleapis.com/auth/tagmanager.publish`
- `https://www.googleapis.com/auth/tagmanager.manage.users`
- `https://www.googleapis.com/auth/tagmanager.manage.accounts`
- `https://www.googleapis.com/auth/business.manage`
- `https://www.googleapis.com/auth/content`

Older tokens with read-only scopes can read Search Console, GA4, and GTM data but cannot submit/delete sitemaps, change GA4 admin resources, edit GTM containers, publish versions, or manage GTM users/accounts.

## Local Check

Run:

```powershell
npm install
npm run auth
npm start
```

`npm start` waits for MCP input over stdio, so a quiet running process is expected.

## If You Move This Folder

Update the path in `.mcp.json`:

```json
"args": ["D:/Codex/google-mcp/index.js"]
```

Set it to the new absolute path of `index.js`.
