# Google Ads Missing Capabilities

This project already supports broad Google Ads read access, deep reports, and guarded write tools. Do not add remove/delete tools for Google Ads unless explicitly requested later.

## Current Coverage

- Account discovery and MCC hierarchy.
- Campaigns, ad groups, ads, keywords, search terms, keyword ideas, historical keyword metrics.
- Deep reports for devices, geo, user locations, landing pages, demographics, budgets, conversion actions, recommendations, change history, negatives, assets, Performance Max, Shopping, audiences, labels, bidding, schedules, placements, topics, and auction insights.
- Guarded writes for campaign status, budgets, dates, bidding, negative keywords, keywords, ads, ad groups, search campaigns, recommendations, sitelink assets, and offline conversions.

All Google Ads writes are blocked unless:

1. `GOOGLE_ADS_ENABLE_MUTATIONS=true`
2. `GOOGLE_ADS_MUTATION_CUSTOMER_IDS` includes the target customer ID
3. `confirm=true`
4. `dry_run=false`

## Missing Read Tools Worth Adding

- `ads_field_metadata`: query the Google Ads Field Service so GAQL fields can be validated before running custom reports.
- `ads_validate_gaql`: validate GAQL syntax/field compatibility before report execution.
- `ads_policy_summary`: pull policy findings/disapproval details across ads, assets, and keywords.
- `ads_asset_group_full_audit`: richer Performance Max asset-group diagnostics.
- `ads_conversion_action_full_audit`: full conversion action configuration, enhanced conversion flags, upload settings, and attribution details.
- `ads_billing_summary`: billing setup/account budget read-only diagnostics where permissions allow.
- `ads_access_audit`: users, invitations, manager links, linked product accounts, and access risk summary.
- `ads_shared_sets_audit`: shared negative keyword lists and placements across campaigns.
- `ads_experiment_full_audit`: experiments, arms, split, status, metrics, and migration readiness.
- `ads_change_summary`: change-event grouping by user/resource/action over a date range.

## Missing Write Tools Worth Adding, Without Remove

- Create campaign budgets.
- Update tracking templates and final URL suffixes at customer, campaign, ad group, keyword, and ad levels.
- Add/update location targets, excluded locations, proximity targets, and ad schedules.
- Add/update campaign and ad group audience targets.
- Add/update asset links for call, callout, structured snippet, image, price, promotion, lead form, and location assets.
- Create/update conversion actions and customer/campaign conversion goal biddable flags.
- Create/update Performance Max asset groups, asset group assets, listing groups, and audience signals.
- Create/update Shopping campaigns and listing groups.
- Create/update experiments and experiment arms.
- Create/update labels and apply labels to campaigns/ad groups/ads/keywords.
- Create account-user invitations or manager links only with strict confirmation and allowlists.

## Guardrails For Future Ads Writes

- Keep the current dry-run default.
- Keep customer allowlists.
- Require `confirm=true`.
- Prefer `validate_only=true` first for new write tools.
- Never implement remove/delete Ads operations by default.
- For medical or sensitive categories, run the policy check before creating copy, audiences, assets, or campaign changes.

Official references:

- Google Ads API overview: https://developers.google.com/google-ads/api/docs/get-started/introduction
- Google Ads API field metadata: https://developers.google.com/google-ads/api/docs/fields
- Google Ads API mutates: https://developers.google.com/google-ads/api/docs/mutating/overview
