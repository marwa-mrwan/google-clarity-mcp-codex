# Google Ads Conversion Tracking

Use this reference for Google-only tracking audits, bidding-readiness checks, and conversion quality diagnosis.

## Required Stack

1. Google tag or GTM firing on all key pages.
2. Google Ads conversion actions configured for the real business goal.
3. Enhanced Conversions enabled and verified for primary conversions.
4. Consent Mode v2 configured where required and documented elsewhere where not required.
5. Offline conversion import for lead generation when CRM quality matters.
6. GA4 linked to Google Ads for analysis, not blindly used as the bidding source.

## Primary vs Secondary

- Primary conversions are the events bidding learns from.
- Secondary conversions are for observation, diagnostics, and funnel context.
- Use macro outcomes as primary: purchase, qualified lead, booked appointment, SQL, closed deal, or equivalent business outcome.
- Keep micro events secondary: page view, scroll, click, add to cart, form start, WhatsApp click, call click, or time on site.

## Duplicate Counting Checks

- Check only enabled conversion actions when looking for duplicates.
- Exclude hidden, removed, and Smart Campaign system-managed conversions from duplicate and attribution-model failures.
- Flag duplicate risk when GA4 import and native Google Ads tag count the same final action as primary.
- Report duplicate findings with conversion action name, ID, source, category, status, primary/secondary setting, counting type, and attribution model.

## Enhanced Conversions

- Should be enabled for key lead or purchase actions where first-party data exists.
- Acceptable implementation: GTM, Google tag, or Google Ads API.
- Verify status in Google Ads, then cross-check that the form/checkout sends hashed email, phone, address, or name data when consent allows it.

## Lead Gen Offline Quality

For lead generation, do not optimize from raw leads only when CRM data exists.

Preferred learning order:
1. Qualified lead or booked appointment.
2. SQL or opportunity.
3. Closed deal or revenue import.

If CRM data is missing, label CPA and lead quality conclusions as directional.

## Attribution and Windows

- Prefer Data-Driven Attribution when available.
- Use Last Click only when intentionally chosen and explain why.
- Match conversion windows to sales cycle: short ecommerce windows can be 7-30 days; lead gen and high-ticket services may need 30-90 days.
- Do not compare very recent periods without allowing for conversion lag.

## Verification

For every tracking recommendation, include:
- Conversion action involved.
- Current setting.
- Required change.
- Owner: analytics, developer, ads, CRM, or client.
- Verification method in Google Ads, GA4, GTM, CRM, or test conversion.
