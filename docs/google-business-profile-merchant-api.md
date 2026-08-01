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

### Business Profile quota troubleshooting

`429 RESOURCE_EXHAUSTED` is a project quota response, not an OAuth failure. Open Google Cloud Console, select the OAuth project, then inspect **APIs & Services > Enabled APIs & services > My Business Account Management API > Quotas**.

- If the quota limit is `0`, submit the Google Business Profile **Basic API Access** application. Do not request a quota increase first.
- If the limit is above `0`, check recent usage and spread requests instead of sending bursts.
- The MCP converts this response into `GBP_QUOTA_EXHAUSTED` with the official quota documentation link.

## Merchant API coverage

Named tools cover:

- accounts and advanced-account subaccounts
- Google Cloud project and developer-contact registration
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

### Register the Google Cloud project

Merchant API requires the authenticating Google Cloud project to be linked to a Merchant Center account. Get the Merchant account ID from Merchant Center, then preview the guarded registration:

```json
{
  "tool": "merchant_register_gcp",
  "arguments": {
    "account_id": "123456789",
    "developer_email": "developer@example.com"
  }
}
```

To execute it, set `MERCHANT_ENABLE_MUTATIONS=true`, then pass `dry_run=false` and `confirm=true`. The email receives the `API_DEVELOPER` role or an invitation if it is not already a Merchant Center user. Wait five minutes before retrying normal Merchant API calls.

Use `merchant_get_developer_registration` with the same `account_id` to inspect the link. A matching unregistered-project `401` is converted into `MERCHANT_GCP_NOT_REGISTERED` with these next steps; unrelated authentication failures remain unchanged.

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
- Business Profile quota limits: https://developers.google.com/my-business/content/limits
- Google My Business REST reference: https://developers.google.com/my-business/reference/rest
- Merchant API REST reference: https://developers.google.com/merchant/api/reference/rest
- Merchant developer registration: https://developers.google.com/merchant/api/guides/quickstart/direct-api-calls
