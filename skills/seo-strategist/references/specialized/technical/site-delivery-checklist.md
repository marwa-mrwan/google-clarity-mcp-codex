# Site Delivery SEO Checklist

Use this checklist as a final site-analysis and delivery QA layer. It supplements the technical audit, on-page checklist, schema references, hreflang references, and tracking audit rules.

Source context: internal `Audit_Checklist` spreadsheet with tabs for technical, schema, implementation edits, WordPress plugins, and tool connections.

## When To Use

Load this file for:
- New website launch checks.
- WordPress delivery checks.
- Arabic/English or translated sites.
- Client site audits that need practical QA beyond pure SEO metrics.
- Final pre-delivery reviews before recommendations are sent to developers.

Do not replace evidence from GSC, crawl tools, PageSpeed, GA4, Clarity, GTM, or manual inspection. Use this as a checklist of checks to verify and prioritize.

## Technical Canonicalization

- Confirm the site resolves to one official version only:
  - HTTP redirects to HTTPS.
  - Either `www` or non-`www` is canonical.
  - Trailing slash behavior is consistent.
- Confirm old indexed URLs return the right final status:
  - Important legacy URLs should be `200` on the new equivalent or `301` to the correct replacement.
  - No important old URLs should end in `302`, `4xx`, or `5xx`.
- Confirm dashboard/admin/staging URLs are not indexable:
  - Staging subdomains and staging folders are blocked by password protection or `noindex` plus robots control.
  - Admin paths are disallowed where appropriate.
  - No internal links point users or crawlers to staging environments.
- Confirm redirect management exists in the CMS/dashboard where the client will need ongoing URL changes.

## Crawlability And Indexability

- `robots.txt` should:
  - Allow important public pages.
  - Block admin/dashboard paths where appropriate.
  - Include the correct sitemap URL.
  - Avoid blocking CSS, JS, images, or resources needed for rendering.
- XML sitemaps should:
  - Include final indexable URLs only.
  - Exclude `404`, `3xx`, `noindex`, staging, dashboard, and duplicate URLs.
  - Include translated URL sets where the site has real Arabic/English counterparts.
- Meta robots should be checked page by page:
  - Indexable pages should use an index/follow equivalent.
  - Dashboard/admin pages should not be indexable.
  - Blog/service pages should reflect whether they are intended for indexation.
- JavaScript-rendered sites should expose important SEO content in rendered HTML:
  - H1.
  - Body copy.
  - Internal links.
  - Canonical.
  - Meta robots.
  - Schema.

## Arabic/English And Hreflang

- Use language-specific URL structure consistently:
  - English URLs under the English section, such as `/en/...`.
  - Arabic URLs under the Arabic section, such as `/ar/...` or the chosen Arabic structure.
- Only show a language switcher when a true translated equivalent exists.
- Remove language switchers from pages with no translated counterpart.
- Add hreflang only for pages with real equivalent content.
- For translated pages, validate:
  - Reciprocal Arabic/English alternates.
  - Correct `hreflang="ar"` and `hreflang="en"`.
  - `x-default` points to the intended default version.
  - Hreflang URLs return `200 OK`.
  - Hreflang URLs are canonical URLs, not redirects.
- Remove hreflang from single-language blog posts or pages that do not have a matching translated version.
- Confirm the `<html>` tag declares language and direction:
  - Arabic pages: `lang="ar"` and usually `dir="rtl"`.
  - English pages: `lang="en"` and usually `dir="ltr"`.

## HTML Head And On-Page Tags

- Every indexable page should have:
  - One self-referencing canonical, or an intentional canonical to the true primary page.
  - One unique `<title>`.
  - One meta description written for CTR and clarity.
  - Correct meta robots.
  - Open Graph tags for social previews.
- Blog and service pages should include accurate dates when relevant:
  - `article:published_time`.
  - `article:modified_time`.
  - CMS updates should correctly update modified time.
- H1 rules:
  - One H1 per page.
  - The H1 can differ from the meta title.
  - Blog/service titles should usually be the H1.
- Heading structure should be logical:
  - No empty headings.
  - No repeated H1s.
  - H2/H3 hierarchy reflects the content outline.
- Breadcrumbs should be visible where useful and supported by BreadcrumbList schema.
- Alt text should be descriptive for important images, especially blog, service, portfolio, and hero images.

## Schema Delivery Checks

Use JSON-LD in the `<head>` or an equivalent valid implementation. Validate with Rich Results Test and Schema.org Validator.

Required or common schema by page type:

| Schema | Scope | Check |
|---|---|---|
| Organization | Sitewide / homepage | Official name, logo, URL, social profiles, contact data. |
| LocalBusiness | Local/service businesses | Correct subtype, NAP, phone, address/service area, opening hours where relevant. |
| WebSite | Sitewide | Site name, URL, and SearchAction only if site search exists. |
| BreadcrumbList | Sitewide where breadcrumbs exist | Matches visible breadcrumb path. |
| Article / BlogPosting | Blog articles only | headline, datePublished, dateModified, author, publisher. |
| Service | Service pages only | Service name, provider, description, areaServed. |
| FAQPage | Pages with visible FAQs only | Only mark up questions and answers visible on the page. |

Never add schema for hidden content. Never add irrelevant schema just because a rich result exists.

## Performance And UX QA

- Measure Core Web Vitals after implementation:
  - LCP under 2.5s.
  - INP under 200ms.
  - CLS under 0.1.
- Check both mobile and desktop.
- Reduce heavy homepage animations if they hurt LCP/INP or user clarity.
- Compress and resize images:
  - Prefer WebP or another modern format.
  - Keep important images appropriately sized.
  - Use lazy loading below the fold.
  - Do not lazy-load the LCP image.
- Mobile QA:
  - Menus work.
  - CTAs are tappable.
  - Forms are usable.
  - Text is readable.
  - No layout overlap.

## Links, CTAs, And Conversion Checks

- External links should open in a new tab when appropriate.
- Footer/developer credit links should be intentional and open safely.
- Social links should exist, point to the correct brand profiles, and open in a new tab.
- Call and WhatsApp links should work:
  - Phone links use `tel:+...`.
  - WhatsApp links use the correct international format.
  - Egypt numbers should include the country code.
- Forms should be tested manually:
  - Submission works.
  - Notifications reach the approved recipient list.
  - Thank-you or success message is clear.
  - Lead source/tracking is preserved where applicable.
- Blog and service templates should include appropriate conversion paths:
  - Side form or clear CTA.
  - Related blogs or related services.
  - FAQ section where useful.

## WordPress Delivery Checks

For WordPress sites, verify installed plugins and avoid duplicate tracking/plugin conflicts.

Common required checks:
- SEO plugin, such as Rank Math, configured correctly.
- Instant indexing plugin only where appropriate.
- GTM installation method is clear:
  - Use one method only.
  - Avoid installing both Google Site Kit and code snippets for the same tag.
  - If Elementor or theme settings can inject GTM cleanly, avoid extra plugin bloat.
- Email log plugin installed when form deliverability needs verification.
- Security plugin, such as Wordfence, configured where required.
- Backup plugin, such as UpdraftPlus, configured where required.
- Custom CTA/FAQ/year shortcode plugin or equivalent site-specific functionality is working.
- Remove or disable broken/unneeded tracking plugins.

## Measurement And Tool Connections

Before closing a site audit or launch QA, verify the required tools are created and connected:

- Google Search Console:
  - Property created for the correct domain.
  - Sitemap submitted.
  - Approved users added.
- Google Tag Manager / Google tag:
  - Container/tag created.
  - Approved users added.
  - Call tag configured where call tracking is required.
  - WhatsApp tag configured where WhatsApp tracking is required.
- GA4:
  - Property created.
  - Approved users added.
  - Key events/conversions defined.
  - Source/medium and landing page reporting are usable.
- Microsoft Clarity:
  - Project exists.
  - Approved users added.
  - Script installed and recording data.

## Audit Output Requirements

When using this checklist in an analysis, include a compact QA table:

| Area | Status | Evidence | Required Action | Priority |
|---|---|---|---|---|

Use these status labels:
- `Pass`: verified and working.
- `Fail`: verified issue.
- `Needs access`: blocked by missing permission.
- `Needs manual test`: requires browser/CMS/manual form test.
- `Not applicable`: the site does not need this item.

Always distinguish:
- SEO-blocking issues.
- Launch/delivery QA issues.
- Tracking/measurement issues.
- Developer implementation tasks.
