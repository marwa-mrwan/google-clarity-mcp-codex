# Google Ads MCC MCP Integration Documentation

هذا المستند يشرح تجهيز Google Ads API وربطه مع MCP server الموجود في هذا المشروع حتى يستطيع قراءة تفاصيل الـ MCC، الحسابات التابعة، الكامبينات، الكلمات، الإعلانات، search terms، والتقارير المتقدمة.

المسارات الحالية في المشروع:

- MCP server: `google-mcp/index.js`
- Google Ads tools: `google-mcp/lib/ads.js`
- OAuth helper: `google-mcp/lib/google-auth.js`
- Local MCP config: `.vscode/mcp.json`
- Local secrets file: `.vscode/mcp.local.env`
- Token file: `.vscode/google.tokens.local.json`

## 1. What Access This MCP Needs

لكي يقرأ الـ MCP بيانات Google Ads عبر MCC، نحتاج 4 طبقات وصول:

1. Google Cloud project مفعل عليه Google Ads API.
2. OAuth Client ID / Client Secret أو service account حسب نوع التشغيل.
3. Google Ads developer token من Google Ads API Center.
4. Google Ads user access على الـ MCC أو advertiser accounts المطلوب قراءتها.

في مشروعك الحالي، أنسب flow هو single-user OAuth لأن الـ MCP يعمل محليا ويقرأ حسابات أنت عندك access عليها. لو الهدف مستقبلا منتج يستخدمه أكثر من مستخدم، استخدمي multi-user OAuth. لو عندك Workspace وسياسات واضحة، يمكن استخدام service account، لكن Google نفسها تضع له شروطا أعلى، وعمليا OAuth user flow أبسط للـ local MCP.

## 2. Required Google Ads Concepts

### Manager account / MCC

الـ MCC هو manager account يستطيع إدارة advertiser accounts أو manager accounts أخرى. Google Ads API يعامل الوصول كـ hierarchy. المستخدم يمكن أن يكون له direct access على MCC، ثم indirect access على الحسابات تحته.

### `login-customer-id`

عند القراءة من حساب advertiser موجود تحت MCC، يجب تمرير رقم الـ MCC في header اسمه `login-customer-id` بدون شرطات. هذا يحدد أي root manager account يستخدمه Google Ads API لتقييم الصلاحيات.

مثال:

- MCC ID في Google Ads UI: `123-456-7890`
- القيمة في env: `GOOGLE_ADS_LOGIN_CUSTOMER_ID=1234567890`
- Client account ID: `555-666-7777`
- قيمة tool argument: `customer_id: "5556667777"`

القاعدة المهمة:

- `GOOGLE_ADS_LOGIN_CUSTOMER_ID` = الـ MCC أو manager account الذي يملك/يدير الحسابات.
- `customer_id` في tool call = الحساب الذي تريدين قراءة بياناته فعليا.

### ListAccessibleCustomers vs hierarchy

`customers:listAccessibleCustomers` يعرض الحسابات التي للمستخدم direct access عليها فقط. هذا لا يعني أنه سيعرض كل الحسابات التابعة للـ MCC. للحصول على الحسابات التابعة، يجب الاستعلام عن `customer_client` من الـ MCC، وهذا موجود حاليا في tool اسمه `ads_list_client_accounts`.

## 3. Google Cloud Setup

1. افتحي Google Cloud Console.
2. اختاري أو أنشئي project مخصصا للـ MCP.
3. فعلي Google Ads API من API Library.
4. جهزي OAuth consent screen.
5. أنشئي OAuth Client:
   - Application type: Desktop app أو Web application.
   - لو Web application، أضيفي redirect URI:

```text
http://localhost:3001/callback
```

6. انسخي:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

## 4. Google Ads API Center Setup

1. افتحي Google Ads MCC الذي سيتم منه إدارة العملاء.
2. من Tools & Settings > API Center.
3. انسخي Developer Token.
4. ضعيه في local env فقط.
5. تأكدي أن مستخدم OAuth نفسه لديه access على الـ MCC.

ملاحظات مهمة:

- الـ developer token لا يحدد أي حسابات يمكنك قراءتها وحده. الصلاحيات تأتي من OAuth user access + account hierarchy.
- لو token في test access، قد يكون محدودا بحسابات test. للوصول لحسابات production يجب أن يكون developer token بمستوى مناسب.

## 5. Local Env Required

ضعي القيم في `.vscode/mcp.local.env` أو أي file مشار إليه بواسطة `MCP_SECRETS_ENV_FILE`.

لا تضعي أسرار حقيقية في README أو Git.

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_ADS_DEVELOPER_TOKEN=...
GOOGLE_ADS_LOGIN_CUSTOMER_ID=...
GOOGLE_ADS_API_VERSION=v24
GOOGLE_ADS_MUTATION_CUSTOMER_IDS=
GOOGLE_TOKEN_FILE=../.vscode/google.tokens.local.json
```

القيمة `GOOGLE_ADS_API_VERSION` اختيارية في الكود الحالي، لأن `google-mcp/lib/ads.js` يجرب أكثر من version تلقائيا. تركها على أحدث stable version واضح أفضل للتشخيص.
استخدمي `GOOGLE_ADS_MUTATION_CUSTOMER_IDS` كـ allowlist للحسابات التي يسمح لها بالتعديل. وجود الحساب في allowlist يكفي للتنفيذ الحقيقي، و`GOOGLE_ADS_ENABLE_MUTATIONS` أصبح legacy اختياري.

## 6. OAuth Scopes

الـ OAuth helper الحالي في `google-mcp/lib/google-auth.js` يطلب هذه scopes، ومنها Google Ads:

```js
"https://www.googleapis.com/auth/adwords"
```

هذا هو scope المطلوب لـ Google Ads API. عند إضافة أو تغيير scopes، يجب تشغيل OAuth مرة أخرى حتى يتم إصدار refresh token يشملها.

## 7. Generate Refresh Token

من داخل فولدر `google-mcp`:

```bash
cd codex-mcp-for-google-clarity-mangools/google-mcp
npm install
npm run auth
```

سيفتح المتصفح OAuth consent. سجلي بنفس Google user الذي لديه access على الـ MCC. بعد الموافقة سيحفظ المشروع token في المسار المحدد بواسطة `GOOGLE_TOKEN_FILE`.

## 8. MCP Configuration

الإعداد الحالي في `.vscode/mcp.json` صحيح لفولدر المشروع:

```json
{
  "servers": {
    "google-marketing-suite": {
      "type": "stdio",
      "command": "node",
      "args": ["${workspaceFolder}/google-mcp/index.js"],
      "envFile": "${workspaceFolder}/.vscode/mcp.local.env",
      "env": {
        "GOOGLE_TOKEN_FILE": "${workspaceFolder}/.vscode/google.tokens.local.json",
        "MARKETING_ACCOUNTS_FILE": "${workspaceFolder}/.vscode/marketing.accounts.local.json"
      }
    }
  }
}
```

بعد تشغيل MCP داخل Codex/VS Code، المفروض تظهر tools التي تبدأ بـ `ads_`.

## 9. Current Google Ads MCP Tools

الأدوات الحالية تغطي read-only analysis:

- `ads_list_accounts`: يعرض الحسابات التي للمستخدم direct access عليها، ويحاول إحضار client accounts تحت manager accounts المتاحة.
- `ads_list_client_accounts`: يعرض accounts تحت MCC معين باستخدام `customer_client`.
- `ads_account_hierarchy`: يعرض MCC hierarchy recursively.
- `ads_customer_details`: يعرض customer metadata, labels, users, invitations, conversion goals.
- `ads_list_campaigns`: الكامبينات و metrics.
- `ads_list_ad_groups`: ad groups و metrics.
- `ads_list_ads`: ad creative text, final URLs, status, metrics.
- `ads_campaign_full_audit`: audit متعدد الأقسام للـ campaign.
- `ads_ad_group_full_audit`: audit متعدد الأقسام للـ ad group.
- `ads_search_terms`: search term view على ad group level.
- `ads_campaign_search_terms`: campaign search term view حيث يكون متاحا، مفيد لبعض PMax/search-term reporting.
- `ads_keyword_performance`: أداء keywords.
- `ads_keyword_ideas`: keyword planning ideas.
- `ads_keyword_historical_metrics`: historical keyword metrics.
- `ads_account_performance`: account-level performance.
- `ads_gaql_query`: read-only GAQL query لأي report غير مغطى.
- `ads_deep_report`: تقارير تحليلية جاهزة مثل devices, locations, budgets, recommendations, change history, negative keywords, assets, PMax asset groups, shopping products.
- Write tools مثل `ads_pause_campaign`, `ads_add_keywords`, و`ads_create_responsive_search_ad` موجودة لكنها محمية بـ allowlist. استخدمي `dry_run=true` فقط لو عايزة preview. Budget tools are suggestion-only.

## 10. Access Validation Checklist

بعد الإعداد، اختبري بالترتيب:

### A. List direct accounts

```json
{
  "tool": "ads_list_accounts",
  "arguments": {}
}
```

النتيجة المتوقعة:

- ظهور الـ MCC الذي للمستخدم direct access عليه.
- لو MCC manager، قد تظهر `clientAccounts` داخله.

### B. List MCC clients

```json
{
  "tool": "ads_list_client_accounts",
  "arguments": {
    "customer_id": "MCC_ID_WITHOUT_DASHES"
  }
}
```

النتيجة المتوقعة:

- قائمة client accounts.
- حقول مثل `id`, `descriptiveName`, `currencyCode`, `timeZone`, `manager`, `level`, `status`.

### C. Read campaigns for a client

```json
{
  "tool": "ads_list_campaigns",
  "arguments": {
    "customer_id": "CLIENT_ACCOUNT_ID_WITHOUT_DASHES",
    "start_date": "2026-06-01",
    "end_date": "2026-06-22"
  }
}
```

### D. Run a safe GAQL query

```json
{
  "tool": "ads_gaql_query",
  "arguments": {
    "customer_id": "CLIENT_ACCOUNT_ID_WITHOUT_DASHES",
    "query": "SELECT campaign.id, campaign.name, campaign.status, metrics.clicks, metrics.cost_micros, metrics.conversions FROM campaign WHERE segments.date DURING LAST_30_DAYS LIMIT 50"
  }
}
```

الكود الحالي يجب أن يمنع mutating GAQL، ويستخدم GAQL للقراءة فقط.

## 11. What The MCP Can Read

باستخدام الأدوات الحالية أو `ads_gaql_query` يمكن قراءة:

- MCC hierarchy and client accounts.
- Customer metadata: name, currency, timezone, manager/client status.
- Campaigns: id, name, status, channel type, bidding, budgets, metrics.
- Ad groups: id, name, status, type, metrics.
- Ads: responsive search ads, final URLs, paths, statuses, metrics.
- Keywords and keyword metrics.
- Search terms where Google Ads API exposes them.
- Locations, devices, demographics, ad schedules.
- Conversion actions and conversion-related reports.
- Recommendations and optimization signals.
- Change history / change events.
- Negative keywords and shared negative lists.
- PMax asset groups and asset reporting where available.
- Shopping product performance where available.

## 12. Write Access / Campaign Changes

تمت إضافة write tools محمية. كل tool يرجع preview افتراضيا ولا ينفذ أي Google Ads mutate call إلا إذا تحققت كل شروط الأمان.

### Read tools المتاحة

| Tool | Purpose |
| --- | --- |
| `ads_list_accounts` | الحسابات المتاحة مباشرة ومحاولة قراءة clients تحت manager accounts. |
| `ads_list_client_accounts` | قراءة client accounts تحت MCC معين. |
| `ads_account_hierarchy` | قراءة hierarchy كاملة recursively. |
| `ads_customer_details` | تفاصيل customer، labels، users، invitations، conversion goals. |
| `ads_list_campaigns` | Campaign list مع metrics. |
| `ads_list_ad_groups` | Ad groups مع campaign structure وmetrics. |
| `ads_list_ads` | Ads والـ creative text وfinal URLs وpolicy status وmetrics. |
| `ads_campaign_full_audit` | Audit شامل للـ campaign من settings, targeting, assets, goals, performance. |
| `ads_ad_group_full_audit` | Audit شامل للـ ad group من keywords, audiences, placements, ads, assets. |
| `ads_search_terms`, `ads_campaign_search_terms` | Search term reporting where available. |
| `ads_keyword_performance`, `ads_keyword_ideas`, `ads_keyword_historical_metrics` | Keyword performance/planner. |
| `ads_account_performance`, `ads_gaql_query`, `ads_deep_report` | Account summary, custom read-only GAQL, and predefined deep reports. |

### Missing/advanced read reports المضافة

| `ads_deep_report.report_type` | Coverage |
| --- | --- |
| `customer_labels`, `customer_user_access`, `customer_user_access_invitations` | Account labels/users/invitations where API access allows. |
| `campaign_settings`, `bidding_strategies`, `campaign_conversion_goals`, `customer_conversion_goals` | Campaign settings, bidding, and conversion goal visibility. |
| `campaign_labels`, `ad_group_labels`, `keyword_quality`, `device_bid_modifiers` | Labels, quality score components, and bid modifiers. |
| `placements`, `topics`, `webpage_targets` | Content targeting, DSA/webpage targets. |
| `campaign_asset_links`, `ad_group_asset_links`, `customer_asset_links`, `asset_details`, `asset_performance` | Assets/extensions and performance. |
| `pmax_asset_groups`, `pmax_asset_group_assets`, `pmax_listing_groups`, `pmax_search_terms` | Performance Max structure and search-term style visibility where available. |
| `shopping_products`, `shopping_listing_groups` | Shopping/product performance and listing groups. |
| `demand_gen_campaigns`, `video_campaigns` | Demand Gen and Video performance reports. |
| Existing reports | Devices, geo/user locations, landing pages, demographics, budgets, recommendations, change events, negatives, auction insights, audiences, locations, schedules, experiments. |

### Write tools الجديدة

| Tool | Purpose |
| --- | --- |
| `ads_pause_campaign`, `ads_enable_campaign` | Pause/enable campaigns. |
| `ads_update_campaign_dates` | Update campaign start/end dates. |
| `ads_update_campaign_bidding`, `ads_update_target_cpa`, `ads_update_target_roas` | Update bidding settings. |
| `ads_create_campaign`, `ads_update_campaign_settings` | Create common Search/Display/Shopping/Demand Gen/Video/PMax campaign shells and update common settings. |
| `ads_suggest_campaign_budget` | Suggest budget values only; no budget mutations are exposed. |
| `ads_set_campaign_locations`, `ads_set_campaign_languages`, `ads_set_campaign_ad_schedules` | Add location, language, and ad schedule targeting. |
| `ads_add_campaign_negative_keywords`, `ads_add_ad_group_negative_keywords` | Add negative keywords. |
| `ads_add_keywords`, `ads_pause_keywords`, `ads_enable_keywords`, `ads_update_keyword_bid` | Manage ad group keywords. |
| `ads_add_display_keywords`, `ads_add_display_placements`, `ads_add_display_topics` | Add Display contextual targeting to ad groups. |
| `ads_pause_ad`, `ads_enable_ad` | Pause/enable ads. |
| `ads_create_responsive_search_ad`, `ads_replace_responsive_search_ad`, `ads_update_responsive_search_ad`, `ads_create_responsive_display_ad`, `ads_create_video_responsive_ad`, `ads_create_shopping_product_ad` | Create/update search ads and create display, video, and shopping ads from existing assets or explicit IDs. RSA text changes use replacement: create a new RSA and optionally pause the old ad. |
| `ads_create_ad_group`, `ads_create_search_campaign` | Create ad groups across supported Search, Display, Shopping, Hotel, Smart, Travel, and Video types, plus a Search campaign shortcut. |
| `ads_create_text_asset`, `ads_upload_image_asset`, `ads_create_youtube_video_asset` | Create real reusable text, image/logo, and YouTube video assets instead of placeholders. |
| `ads_create_pmax_asset_group`, `ads_update_asset_group`, `ads_link_asset_to_asset_group`, `ads_add_pmax_search_themes`, `ads_add_pmax_audience_signal` | Create/update Performance Max asset groups, link existing assets, and add signals. |
| `ads_create_custom_audience`, `ads_create_audience_from_custom_audiences`, `ads_add_audience_to_ad_group` | Create custom audiences, wrap them in Audience resources, and target ad groups. |
| `ads_apply_recommendation`, `ads_dismiss_recommendation` | Apply/dismiss recommendations. |
| `ads_add_sitelink_asset`, `ads_link_asset_to_campaign` | Create/link sitelink assets. |
| `ads_upload_offline_conversion` | Upload click conversions with explicit payload. |

Campaign creation notes:

- Budget creation and edits are manual-only. Use `ads_suggest_campaign_budget` for recommendations, then create/edit budgets in Google Ads and pass the existing `budget_id` to campaign creation tools.
- Reused budgets must be created with `explicitly_shared=true`; otherwise Google Ads rejects reuse of an implicitly shared budget.
- Google Ads v24 requires `contains_eu_political_advertising`. The write tools default it to `DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING` unless explicitly provided.

### Safety requirements

كل write tool يدعم:

- `dry_run=false` للحسابات الموجودة في allowlist. استخدمي `dry_run=true` لو عايزة preview فقط.
- `confirm=false` by default. الحسابات الموجودة في `GOOGLE_ADS_MUTATION_CUSTOMER_IDS` تعتبر confirmed ومفعلة للتعديل ضمنيا.
- `validate_only=false` optional.
- `partial_failure=true` optional. It is omitted by default because some Google Ads mutate endpoints reject an explicit false flag.

لا يتم تنفيذ mutation إلا إذا:

1. `GOOGLE_ADS_MUTATION_CUSTOMER_IDS` يحتوي `customer_id` المطلوب بدون شرطات
2. لا ترسلي `dry_run=true`

`GOOGLE_ADS_ENABLE_MUTATIONS=true` و`confirm=true` ما زالوا مدعومين كـ legacy flags، لكنهم غير مطلوبين للحسابات الموجودة في allowlist.

لو أي شرط غير متحقق، يرجع الـ MCP `preview` للـ request و`blockedReasons` ولا يضرب mutate endpoint.

مثال env:

```env
GOOGLE_ADS_MUTATION_CUSTOMER_IDS=1234567890,5556667777
```

### أمثلة تشغيل

قراءة كل MCC clients:

```json
{
  "tool": "ads_account_hierarchy",
  "arguments": {
    "customer_id": "MCC_ID_WITHOUT_DASHES",
    "max_depth": 5
  }
}
```

Campaign full audit:

```json
{
  "tool": "ads_campaign_full_audit",
  "arguments": {
    "customer_id": "CLIENT_ACCOUNT_ID_WITHOUT_DASHES",
    "campaign_id": "CAMPAIGN_ID",
    "start_date": "2026-06-01",
    "end_date": "2026-06-22"
  }
}
```

Budget suggestion:

```json
{
  "tool": "ads_suggest_campaign_budget",
  "arguments": {
    "customer_id": "CLIENT_ACCOUNT_ID_WITHOUT_DASHES",
    "monthly_budget": 30000,
    "expected_cpc": 12
  }
}
```

Pause campaign dry-run:

```json
{
  "tool": "ads_pause_campaign",
  "arguments": {
    "customer_id": "CLIENT_ACCOUNT_ID_WITHOUT_DASHES",
    "campaign_id": "CAMPAIGN_ID",
    "dry_run": true
  }
}
```

Add negative keyword dry-run:

```json
{
  "tool": "ads_add_campaign_negative_keywords",
  "arguments": {
    "customer_id": "CLIENT_ACCOUNT_ID_WITHOUT_DASHES",
    "campaign_id": "CAMPAIGN_ID",
    "keywords": ["free", "jobs"],
    "match_type": "PHRASE",
    "dry_run": true
  }
}
```

## 13. Common Errors

### `USER_PERMISSION_DENIED`

الأسباب الأكثر شيوعا:

- OAuth user ليس لديه access على الـ MCC أو client account.
- `GOOGLE_ADS_LOGIN_CUSTOMER_ID` غير صحيح.
- تم استخدام client account كـ login customer بدلا من MCC.
- الحساب ليس تحت هذا الـ MCC.
- refresh token صدر من Google user آخر.

الحل:

1. تأكدي من دخول OAuth بنفس user الموجود في MCC.
2. استخدمي MCC ID بدون شرطات في `GOOGLE_ADS_LOGIN_CUSTOMER_ID`.
3. شغلي `ads_list_accounts`.
4. شغلي `ads_list_client_accounts` على MCC.
5. جربي `ads_list_campaigns` على client account ظاهر من الخطوة السابقة.

### Empty `ads_list_accounts`

غالبا OAuth user لا يملك direct access لأي account، أو refresh token صدر من user خاطئ.

### Some clients missing

هذا طبيعي مع `ListAccessibleCustomers`. استخدمي `ads_list_client_accounts` على الـ MCC لقراءة الحسابات التابعة.

### `DEVELOPER_TOKEN_PROHIBITED` or access-level issues

راجعي Google Ads API Center. قد يكون developer token غير مفعّل للإنتاج أو مربوط بإعدادات لا تسمح بالحساب المطلوب.

### API version error

ضعي `GOOGLE_ADS_API_VERSION` على version مدعوم، أو اتركي الكود يجرب versions الافتراضية. المشروع الحالي يجرب `v24`, `v23`, `v22`, `v21`.

## 14. Security Checklist

- لا تحفظي `.vscode/mcp.local.env` في Git.
- لا تعرضي refresh token أو client secret في tickets أو screenshots.
- لو أي secret اتعرض خارج جهازك، اعملي rotate فورا:
  - Reset OAuth client secret من Google Cloud.
  - Reset developer token من Google Ads API Center إذا كان اتكشف.
  - Revoke OAuth access من Google Account permissions ثم شغلي `npm run auth` من جديد.
- استخدمي Secret Manager في أي deployment مش local.
- راقبي logs حتى لا تطبع headers أو tokens.

## 15. Official References

- Google Ads MCP server: https://developers.google.com/google-ads/api/docs/developer-toolkit/mcp-server
- OAuth overview: https://developers.google.com/google-ads/api/docs/oauth/overview
- Google Ads access model: https://developers.google.com/google-ads/api/docs/oauth/access-model
- API call structure and `login-customer-id`: https://developers.google.com/google-ads/api/docs/concepts/call-structure
- List accessible accounts: https://developers.google.com/google-ads/api/docs/account-management/listing-accounts
- Get account hierarchy: https://developers.google.com/google-ads/api/docs/account-management/get-account-hierarchy
- Create campaigns: https://developers.google.com/google-ads/api/docs/campaigns/create-campaigns
- Reporting overview: https://developers.google.com/google-ads/api/docs/reporting/overview
- GAQL overview: https://developers.google.com/google-ads/api/docs/query/overview
- Mutating resources: https://developers.google.com/google-ads/api/docs/mutating/overview
- Recommendations overview: https://developers.google.com/google-ads/api/docs/recommendations/overview
- Apply recommendations: https://developers.google.com/google-ads/api/docs/recommendations/apply-recommendations
- Offline conversions: https://developers.google.com/google-ads/api/docs/conversions/upload-clicks
- Credential management: https://developers.google.com/google-ads/api/docs/oauth/credential-management
- Secure credentials: https://developers.google.com/google-ads/api/docs/productionize/secure-credentials
