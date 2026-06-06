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

## Google Ads Tools

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

Use `ads_list_ads` when you need actual ad creative text such as responsive search ad headlines and descriptions, expanded text ad copy, final URLs, paths, statuses, and performance metrics. Use `ads_list_ad_groups` when you need the campaign > ad group structure with metrics.

Use `ads_gaql_query` for any advanced read-only GAQL report that is not covered by a dedicated tool. Use `ads_deep_report` for common analysis reports: devices, geo/user locations, landing pages, demographics, campaign budgets, conversion actions, recommendations, change history, negative keywords, assets, Performance Max asset groups, and Shopping products.

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

- Business Profile:
  - `gbp_list_accounts`
  - `gbp_list_locations`
  - `gbp_get_location`
  - `gbp_performance`
  - `gbp_search_keyword_impressions`
- Merchant Center:
  - `merchant_list_accounts`
  - `merchant_list_subaccounts`
  - `merchant_list_products`
  - `merchant_list_issues`
  - `merchant_search_report`
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
GOOGLE_ADS_LOGIN_CUSTOMER_ID=...
```

`GOOGLE_ADS_DEVELOPER_TOKEN` and `GOOGLE_ADS_LOGIN_CUSTOMER_ID` are only needed for Google Ads tools.

After adding new Google scopes, rerun `npm run auth` so the refresh token includes:

- `https://www.googleapis.com/auth/business.manage`
- `https://www.googleapis.com/auth/content`

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
