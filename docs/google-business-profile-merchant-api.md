# Google Ads Multi-MCC, Business Profile, and Merchant API

## Google Ads multi-MCC routing

`ads_discover_accounts` calls `customers:listAccessibleCustomers`, inspects every directly accessible account, identifies manager accounts, reads each manager's `customer_client` hierarchy, and caches the matching `login-customer-id` for every discovered client.

Google documents that `ListAccessibleCustomers` only returns accounts where the OAuth user has direct access. It does not return every descendant under an MCC, so the MCP follows it with `customer_client` queries.

Optional explicit fallback configuration:

```env
GOOGLE_ADS_LOGIN_CUSTOMER_IDS=1234567890,9876543210
```

The legacy singular `GOOGLE_ADS_LOGIN_CUSTOMER_ID` is still accepted. Every customer-scoped tool also accepts `login_customer_id` for a one-call override.

Recommended first call after connecting a Google user:

```json
{
  "tool": "ads_discover_accounts",
  "arguments": { "refresh": true }
}
```

The response includes direct account count, direct MCC count, all discovered routes, and the configured fallback managers.

## Business Profile coverage

The MCP uses Google's federated Business Profile services rather than treating the product as one API:

- Account Management
- Business Information
- Performance
- Notifications
- Verifications
- Business Calls
- Lodging
- Place Actions
- Q&A
- Google My Business v4 for reviews, posts, and media

Named tools cover the normal workflows: account/location CRUD, reviews and replies, posts, media, questions and answers, verification, categories, attributes, Pub/Sub notifications, action links, lodging, calls, and performance.

`gbp_api_call` covers remaining official methods. It accepts a service enum plus a relative path. Full URLs, path traversal, fragments, backslashes, and line breaks are rejected.

Business Profile API access requires Google approval for the project and the relevant APIs enabled in Google Cloud. OAuth uses:

```text
https://www.googleapis.com/auth/business.manage
```

## Merchant API coverage

Named tools cover:

- accounts and advanced-account subaccounts
- processed products and writable product inputs
- data sources and immediate fetches
- promotions
- local and regional inventory
- conversion sources
- Merchant Center Query Language reports
- issue resolution rendering
- API quota usage

`merchant_api_call` covers the rest of the documented Merchant API surface through a fixed service allowlist: accounts, products, reports, data sources, inventories, promotions, conversions, quota, issue resolution, notifications, local feeds partnership, order tracking, reviews, Product Studio, loyalty customers, and YouTube shopping services. Stable v1 is used where Google publishes it; alpha/beta service names are explicit where that is the only documented version.

OAuth uses:

```text
https://www.googleapis.com/auth/content
```

## Mutation safety

Writes never execute by default. Dry-run returns the exact service, method, endpoint, query parameters, and body without requesting an access token or calling Google.

Business Profile write:

```env
GBP_ENABLE_MUTATIONS=true
```

Merchant write:

```env
MERCHANT_ENABLE_MUTATIONS=true
```

Each write call must also include:

```json
{
  "dry_run": false,
  "confirm": true
}
```

Google Ads keeps its existing stronger customer allowlist:

```env
GOOGLE_ADS_ENABLE_MUTATIONS=true
GOOGLE_ADS_MUTATION_CUSTOMER_IDS=1111111111,2222222222
```

## Local verification

```powershell
cd google-mcp
npm.cmd test
node --check index.js
```

After adding scopes or changing the Google user, rerun `npm run auth` and restart the MCP server.

## Official references

- Google Ads account listing: https://developers.google.com/google-ads/api/docs/account-management/listing-accounts
- Business Profile API overview: https://developers.google.com/my-business/ref_overview
- Business Profile basic setup: https://developers.google.com/my-business/content/basic-setup
- Google My Business REST reference: https://developers.google.com/my-business/reference/rest
- Merchant API REST reference: https://developers.google.com/merchant/api/reference/rest
