# SEO Report Sheet Tab Schema

Use this reference when building a client-ready SEO execution workbook after a technical SEO audit.

## Dashboard

Columns: Metric, Latest Crawl, Previous Report Figure, Decision Note.

Include totals for crawled URLs, failed fetch, redirected URLs, long titles, missing/long meta, missing/multiple H1, thin pages, invalid JSON-LD, missing image alt, canonical mismatch, noindex pages, issue rows, cluster rows, and missing data.

## Fix Playbook

Columns: Issue, When To Use, Exact Fix Steps, Validation KPI.

Use for reusable instructions, not URL-level rows.

## Cannibalization Decisions

Columns: Cluster, URL, Clicks, Impressions, CTR, Avg Position, Proposed Owner, Is Owner?, Query Overlap Count, Query Overlap Sample, Top Queries, Current Title, Current H1, Word Count, Intent, Suggested Action, Decision Reason, Exact Recommendation, Checklist.

Actions: Protect Owner, Merge, De-optimize, Differentiate, Noindex/Redirect.

## Service Page Needs

Columns: Service, Service URL, Clicks, Impressions, CTR, Avg Position, Top Queries, Primary Keywords, Search Intent, What The Page Needs, Exact Content/UX Fix, Schema Needed, Priority, Verification KPI, Checklist.

Use for service, category, product, or money-page improvement work: content blocks, UX, pricing, proof, FAQ, CTAs, local trust, schema, and measurement.

## Service Internal Links

Columns: Service, Link Direction, Source URL, Source Clicks, Source Impressions, Target URL(internal link), Internal Link Anchor Text, Why Add This Link, Placement Recommendation, Priority, Checklist.

Use for hub/supporting page links, category/product links, and service-to-related-service links.

## Article Internal Link

Columns: Cluster, Source Article URL, Source Clicks, Source Impressions, Target URL, Target Type, Anchor Text, Why This Link, Placement Recommendation, Priority, Checklist.

Color or group rows by source article URL so repeated recommendations for one article are easy to execute.

## Schema Fixes

Columns: URL, Current Title, Page Type, Current JSON-LD Count, Invalid JSON-LD Count, Recommended Primary Schema, Recommended Additional Schema, Exact Schema Action, Priority, Validation, Checklist.

Schema choices must match visible page type. Common choices: Organization, LocalBusiness subtype, Service, Product, Article/BlogPosting, BreadcrumbList, FAQPage only when visible.

## Issue - Titles

Columns: Priority, URL, Issue, Severity, Evidence, Business/SEO Impact, Likely Root Cause, Recommended Fix, Action Type, Verification, Checklist.

No `Final URL` column unless redirects are being fixed.

## Issue - Meta

Same shape as `Issue - Titles`.

## Issue - H1

Columns: Priority, URL, Issue, Severity, Evidence, Business/SEO Impact, Likely Root Cause, Recommended Fix, Action Type, Verification, Separated Tab Note, Checklist.

## Issue - Thin Pages

Columns: URL, Page Type, Word Count, GSC Clicks, GSC Impressions, GSC CTR, GSC Avg Position, GA4 Sessions, Decision, Redirect/Owner Target, Exact Recommendation, Priority, Data Source, Checklist.

Decision rules:

- Improve/expand if GSC or GA4 shows meaningful demand.
- Noindex if the page has no search goal and no conversion role.
- 301 redirect if a close owner page exists and the page has no distinct intent.

## Issue - Image Alt

Columns: Page URL, Image URL, Alt Status, Current Alt Text, File Type, Size KB, Needs WebP/AVIF?, Needs Compression?, Exact Recommendation, Priority, Checklist.

Group repeated image URLs visually.

## Issue - Redirects

Columns: Redirected URL, Final URL, HTTP Status, Sitemap Fix, Internal Links Fix, Redirect Keep?, Priority, Verification, Checklist.

Keep useful redirects, but remove redirected URLs from XML sitemaps and internal links.

## Issue - Noindex Sitemap

Columns: URL, Type, Current Indexability, Sitemap Action, Recommended Robots Action, Why, Redirect Needed?, Priority, Verification, Checklist.

Use for thank-you pages, landing tests, sliders, feature pages, tags, low-value categories, faceted/parameter URLs, and archive pages.

## Pages Audit

Columns: URL, Status, Canonical, Canonical Mismatch, Title, Title Length, Meta Length, H1 Count, H1 Text, Redirect To, Word Count, Images, Missing Alt, JSON-LD Count, Invalid JSON-LD, Noindex, Checklist.

Keep this as audit evidence, not the primary execution list.

## Doc Coverage Gaps

Columns: Gap Topic, What Is Missing, Where To Add, Recommended Sheet Action, Priority, Evidence, Checklist.

Use only when a Google Doc or written report has items not clearly represented in the sheet.

## Keyword Gap

Columns: Keyword/Topic, Intent, Current Owner Page, Proposed Owner Page, Current Position, Clicks, Impressions, Search Volume, Difficulty, Competitor Example, Required Action, Priority, Verification KPI, Checklist.

Use when keyword opportunities are not already represented by service/content tabs.

## Authority Backlinks

Columns: Target Page, Link/Authority Opportunity, Source Type, Why It Matters, Anchor/Message Angle, Risk Notes, Priority, Owner, Status, Verification KPI, Checklist.

Use only white-hat authority work: digital PR, citations, partnerships, unlinked mentions, resource pages, local directories, expert commentary, and content assets.

## Speed CWV

Columns: URL, Device, LCP, INP, CLS, PSI/CWV Status, Main Bottleneck, Exact Technical Fix, Owner, Priority, Verification, Checklist.

Use when PageSpeed/Lighthouse/CrUX data is available or when a speed check is pending due to quota/rate limits.
