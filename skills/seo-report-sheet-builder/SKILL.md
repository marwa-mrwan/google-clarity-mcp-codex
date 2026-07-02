---
name: seo-report-sheet-builder
description: Build client-ready SEO execution report sheets after a technical SEO audit. Use when Codex needs to turn crawl, GSC, GA4, schema, sitemap, image, internal-linking, cannibalization, keyword-gap, backlink, or report-review findings into a structured Google Sheets action plan with separated tabs, checklist columns, and clear technical/content priorities.
---

# SEO Report Sheet Builder

Use this skill after a proper technical SEO audit when the user wants a practical SEO report sheet, not a generic narrative report.

The output should be an execution workbook: clear tabs, clear owners, evidence, exact fixes, priorities, and checkboxes. Keep it reusable across clients. Do not include client-specific examples, URLs, brand names, or old project names in the skill output unless they come from the current user's data.

## Required Inputs

Gather the available sources before creating or editing the sheet:

- Crawl data: URL, status, final URL, title, meta, H1, canonical, noindex, word count, images, alt text, JSON-LD, schema validity, sitemap membership, redirect signals.
- GSC page/query performance: clicks, impressions, CTR, average position, query overlap, owner page candidates.
- GA4 landing page sessions, engagement, conversions, and key events where available.
- Sitemap and redirect checks.
- Service, category, product, article, or landing page lists.
- Optional: Google Doc/report draft to compare coverage against the sheet.
- Optional: GTM/GA4 tracking audit output for measurement gaps.
- Optional: Mangools/backlink/keyword-gap exports for opportunity tabs.

If live Google Sheets is involved, use the Google Sheets skill and read its live-read/edit references first.

## Workbook Structure

Create or maintain these tabs in this order:

1. `Dashboard`
2. `Fix Playbook`
3. `Cannibalization Decisions`
4. `Service Page Needs`
5. `Service Internal Links`
6. `Article Internal Link`
7. `Schema Fixes`
8. `Issue - Titles`
9. `Issue - Meta`
10. `Issue - H1`
11. `Issue - Thin Pages`
12. `Issue - Image Alt`
13. `Issue - Redirects`
14. `Issue - Noindex Sitemap`
15. `Pages Audit`
16. `Doc Coverage Gaps` when comparing against a report/doc
17. `Keyword Gap` when keyword opportunities are not already represented
18. `Authority Backlinks` when authority/link work is part of the plan
19. `Speed CWV` when PageSpeed, Lighthouse, CrUX, or Core Web Vitals findings are available or pending

Do not keep a broad `All Issues` tab after splitting issues into dedicated tabs unless the user explicitly asks for a raw dump.

Read `references/tab-schema.md` for the complete tab and column plan.

## Non-Duplication Rules

- If a problem is already covered in `Service Page Needs`, `Service Internal Links`, `Article Internal Link`, or `Cannibalization Decisions`, do not repeat it in generic issue tabs.
- Keep service/category/product page improvement work in the relevant needs tab.
- Keep service-to-service, category-to-product, and hub-to-supporting-page links in `Service Internal Links`.
- Keep article-to-owner and article-to-article links in `Article Internal Link`.
- Keep merge, de-optimize, differentiate, or owner-protection decisions in `Cannibalization Decisions`.
- Keep purely technical problems in dedicated `Issue - ...` tabs.
- Keep redirected sitemap cleanup in `Issue - Redirects`; keep noindex/removal decisions in `Issue - Noindex Sitemap` unless the action is genuinely identical.
- `Pages Audit` is evidence, not the main task list.

## Decision Rules

- For thin pages, use GSC and GA4 before choosing improve, noindex, or redirect.
  - Meaningful clicks, impressions, sessions, conversions, or strong intent: improve/expand first.
  - No demand and no clear purpose: noindex/remove from sitemap or 301 to the closest relevant owner.
- For cannibalization, choose the owner using clicks, impressions, current position, intent fit, query overlap, page type, and conversion role.
- Do not change title/H1/meta for a page with possible cannibalization until the owner page is chosen.
- For redirects, keep useful 301 redirects for users and old links, but remove redirected URLs from XML sitemap and update internal links to final canonical URLs.
- For image issues, include both page URL and image URL. Mark non-WebP/AVIF assets and missing/weak alt text separately.
- For schema, recommend only schema that matches visible content. Do not add FAQ schema unless FAQ content is visible on-page.
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
- Every actionable tab must include final `Checklist` column with checkbox values (`FALSE` by default).
- Do not include `Final URL` except in redirect-relevant tabs.

## Workflow

1. Confirm the audit site, date range, country/language, and available sources.
2. Run or inspect the technical audit first: crawlability, indexability, sitemap, redirects, canonical, metadata, headings, schema, images, thin pages, and speed/CWV.
3. Pull or inspect GSC/GA4/Mangools/backlink data where available.
4. Build normalized source data and classify rows into tab-specific buckets.
5. Split broad findings into dedicated tabs; remove duplicate rows across execution tabs.
6. Add exact recommendations, priority, owner/dependency, verification KPI, and source labels.
7. Apply formatting, filters, frozen rows, checkbox columns, and LTR.
8. Verify the workbook against the checklist below before final response.

## Verification Checklist

Before final response:

- Confirm all expected tabs exist, or explain why a tab was intentionally skipped.
- Confirm actionable tabs have `Checklist`.
- Confirm no broad `All Issues` tab remains unless requested.
- Confirm `Final URL` appears only in redirect-relevant tabs.
- Confirm `Pages Audit` remains evidence, not the main action queue.
- Confirm duplicated issues were merged or routed to the most specific tab.
- Confirm technical findings are separated from service/content/cannibalization actions.
- Confirm data sources and date ranges are recorded in the sheet or final summary.
- Confirm remaining gaps are labeled precisely: `not checked`, `tool failed`, `rate-limited`, `not configured`, or `available but not used`.

## Helper Script

Use `scripts/summarize-payload.mjs` to inspect a local sheet payload JSON before upload or after generation:

```bash
node skills/seo-report-sheet-builder/scripts/summarize-payload.mjs path/to/payload.json
```

The script checks expected tabs, row counts, checklist columns, and unintended `Final URL` columns outside redirect tabs.
