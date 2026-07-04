---
name: seo-report-sheet-builder
description: Build client-ready SEO execution report sheets after a technical SEO audit. Use when Codex needs to turn crawl, GSC, GA4, schema, sitemap, image, internal-linking, cannibalization, keyword-gap, backlink, or report-review findings into a structured Google Sheets action plan with separated tabs, checklist columns, and clear technical/content priorities.
---

# SEO Report Sheet Builder

Use this skill after a proper technical SEO audit when the user wants a practical SEO report sheet, not a generic narrative report.

The output should be an execution workbook: clear tabs, clear owners, evidence, exact fixes, priorities, and checkboxes. Keep it reusable across clients, with no old client examples unless they come from the current user's data.

## Required Inputs

Gather the available sources before creating or editing the sheet:

- Crawl data from Screaming Frog, SEMrush, site crawler, or custom export: URL, status, final URL, title, meta, H1, canonical, noindex, word count, images, alt text, JSON-LD, schema validity, sitemap membership, redirect signals, robots.txt.
- GSC page/query performance: clicks, impressions, CTR, average position, query overlap, owner page candidates.
- GA4 landing page sessions, engagement, conversions, and key events where available.
- Sitemap and redirect checks.
- Service, category, product, article, or landing page lists.
- Optional: Google Doc/report draft to compare coverage against the sheet.
- Optional: GTM/GA4 tracking audit output for measurement gaps.
- Optional: SEMrush Site Audit/Organic Research/Backlink reports, Screaming Frog exports, Mangools/backlink/keyword-gap exports for opportunity tabs.

If live Google Sheets is involved, use the Google Sheets skill and read its live-read/edit references first.

## Workbook Structure

Create or maintain these tabs in this order:

1. `Dashboard`
2. `Fix Playbook`
3. `Cannibalization Decisions`
4. `Article Page Needs`
5. `Service Page Needs`
6. `Service Internal Links`
7. `Article Internal Link`
8. `Schema Fixes`
9. `Issue - Titles`
10. `Issue - Meta`
11. `Issue - H1`
12. `Issue - Thin Pages`
13. `Issue - Image`
14. `Issue - Redirects`
15. `Issue - Links in Sitemap`
16. `Issue - Robots.txt`
17. `Pages Audit`
18. `Doc Coverage Gaps` when comparing against a report/doc
19. `Keyword Gap` when keyword opportunities are not already represented
20. `Authority Backlinks` when authority/link work is part of the plan
21. `Speed CWV` when PageSpeed, Lighthouse, CrUX, or Core Web Vitals findings are available or pending

Do not keep a broad `All Issues` tab after splitting issues into dedicated tabs unless the user explicitly asks for a raw dump.

Read `references/tab-schema.md` for the complete tab and column plan.

## Non-Duplication Rules

- If a problem is already covered in `Service Page Needs`, `Article Page Needs`, `Service Internal Links`, `Article Internal Link`, or `Cannibalization Decisions`, do not repeat it in generic issue tabs.
- If multiple sources report the same issue for the same URL, merge them into one row with combined evidence/source labels instead of creating duplicate recommendations.
- A single URL can appear in multiple tabs only when each tab has a genuinely different action type, such as content rewrite, schema fix, image fix, and redirect cleanup. Do not create several competing recommendations for the same URL and issue type.
- Keep service/category/product page improvement work in the relevant needs tab.
- Keep service-to-service, category-to-product, and hub-to-supporting-page links in `Service Internal Links`.
- Keep article-to-owner and article-to-article links in `Article Internal Link`.
- Keep merge, de-optimize, differentiate, or owner-protection decisions in `Cannibalization Decisions`.
- Keep purely technical problems in dedicated `Issue - ...` tabs.
- Keep redirected sitemap cleanup in `Issue - Redirects`; keep noindex/sitemap/removal decisions in `Issue - Links in Sitemap` unless the action is genuinely identical.
- `Pages Audit` is evidence, not the main task list.

## Decision Rules

- For thin pages, use GSC and GA4 before choosing improve, noindex, or redirect.
  - Meaningful clicks, impressions, sessions, conversions, or strong intent: improve/expand first.
  - No demand and no clear purpose: noindex/remove from sitemap or 301 to the closest relevant owner.
- For cannibalization, choose the owner using clicks, impressions, current position, intent fit, query overlap, page type, and conversion role.
- Do not change title/H1/meta for a page with possible cannibalization until the owner page is chosen.
- For redirects, keep useful 301 redirects for users and old links, but remove redirected URLs from XML sitemap and update internal links to final canonical URLs.
- For image issues, include both page URL and image URL. Mark non-WebP/AVIF assets and missing/weak alt text separately.
- For schema, recommend only schema that matches visible content.
- For Core Web Vitals, use LCP < 2.5s, INP < 200ms, CLS < 0.1 as pass thresholds.
- For keyword gap and authority tabs, keep recommendations white-hat, source-labeled, and mapped to a target page.

## Formatting Rules

- Set every sheet tab to LTR (`rightToLeft: false`) unless the user explicitly requests RTL.
- Freeze row 1 on every tab.
- Freeze important identity columns on large tabs, especially URL/source columns.
- Apply filters to header rows.
- Use distinct tab colors and header backgrounds.
- Use alternating row groups by source URL, cluster, service/category, page type, or image URL where visual grouping helps execution.
- Wrap long text and size columns for scanning.
- Every actionable tab must include final `Checklist` column with checkbox values (`FALSE` by default) for rows with data only.
- Do not include `Final URL` except in redirect-relevant tabs.
- Fit row and column sizes to data except for URL columns, which should be wide enough to read the URL.

## Workflow

1. Confirm the audit site, date range, country/language, and available sources.
2. Run or inspect a website-wide technical audit first: crawlability, indexability, sitemap, redirects, canonical, metadata, headings, schema, images, thin pages, and speed/CWV for every URL discovered on the website.
3. Pull or inspect GSC/GA4/Mangools/backlink data where available, and merge SEMrush/Screaming Frog issues with the same URL-level records.
4. Build normalized source data and classify rows into tab-specific buckets.
5. Split broad findings into dedicated tabs; remove duplicate rows across execution tabs.
6. Add exact recommendations, priority, owner/dependency, verification KPI, and source labels.
7. Apply formatting, filters, frozen rows, checkbox columns, and LTR.
8. Verify the workbook against the checklist below before final response.

## Verification Checklist

Before final response:

- Confirm all expected tabs exist, or explain why a tab was intentionally skipped.
- Confirm actionable tabs have `Checklist` for rows with data only.
- Confirm no broad `All Issues` tab remains unless requested.
- Confirm `Final URL` appears only in redirect-relevant tabs.
- Confirm `Pages Audit` remains evidence, not the main action queue.
- Confirm duplicated issues were merged or routed to the most specific tab.
- Confirm technical findings are separated from service/content/cannibalization actions.
- Confirm data sources and date ranges are recorded in the sheet or final summary.
- Confirm remaining gaps are labeled precisely: `not checked`, `tool failed`, `rate-limited`, `not configured`, or `available but not used`.
- Confirm every URL in the website has been checked for crawlability, indexability, sitemap membership, redirects, canonical, metadata, headings, schema, images, thin pages, and speed/CWV, or explicitly list any URL discovery gaps such as blocked crawl, missing sitemap, export limit, or tool failure.

## Helper Script

Use `scripts/summarize-payload.mjs` to inspect a local sheet payload JSON before upload or after generation:

```bash
node skills/seo-report-sheet-builder/scripts/summarize-payload.mjs path/to/payload.json
```

The script checks expected tabs, row counts, checklist columns, and unintended `Final URL` columns outside redirect tabs.
