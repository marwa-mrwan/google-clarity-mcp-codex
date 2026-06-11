# Technical SEO Audit Template

## How to Use
Reference this file when user requests a Technical Audit.
Always fill actual data — never leave placeholders without flagging them as "data needed."

---

## Phase 1: Pre-Audit Checklist
Before starting, collect:
- [ ] Site URL + CMS (WordPress / Shopify / Custom)
- [ ] Access to GSC (via MCP or manual export)
- [ ] Access to GA4 (optional)
- [ ] Screaming Frog / crawl data (if user has it)
- [ ] Any known issues the user wants to prioritize

---

## Section 1: Crawlability & Indexation

### 1.1 Robots.txt
- URL: `domain.com/robots.txt`
- Critical checks:
  - Is sitemap declared? `Sitemap: https://...`
  - Are critical paths accidentally blocked? (`/products`, `/blog`, etc.)
  - Any wildcard blocks that could harm indexation?

| Path | Status | Intentional? | Action |
|------|--------|-------------|--------|
| /example | Blocked | Yes/No | Keep / Fix |

### 1.2 XML Sitemap Health
- URL: `domain.com/sitemap.xml`

| Metric | Value | Status |
|--------|-------|--------|
| Total URLs in sitemap | X | — |
| Indexed (GSC) | Y | — |
| Index ratio | Y/X % | ✅ >80% / ⚠️ <80% |
| 404s in sitemap | X | ❌ Must fix |
| Non-canonical URLs | X | ❌ Must fix |
| Noindex pages in sitemap | X | ❌ Must fix |

### 1.3 Index Coverage (GSC)
Pull from GSC → Coverage report:

| Status | Count | Priority |
|--------|-------|----------|
| Valid | X | ✅ |
| Excluded - Noindex | X | Review intent |
| Crawled - Not indexed | X | ⚠️ Content quality issue |
| Discovered - Not crawled | X | ⚠️ Crawl budget issue |
| 404 errors | X | ❌ Fix immediately |
| Redirect errors | X | ❌ Fix immediately |

**Red flags:**
- "Crawled - Not indexed" > 10% of total pages → content quality or duplication issue
- "Discovered - Not crawled" high → crawl budget or internal linking issue

---

## Section 2: Site Architecture

### 2.1 URL Structure
- Max click depth from homepage: X clicks (target: ≤3)
- URL pattern: `domain.com/[category]/[subcategory]/[page]`

Issues to flag:
- [ ] Pages deeper than 4 clicks from homepage
- [ ] Orphaned pages (0 internal links pointing to them)
- [ ] Redirect chains (A→B→C — consolidate to A→C)
- [ ] Dynamic URLs with parameters causing duplication

### 2.2 Internal Link Distribution
| Page | Internal Links Pointing To It | Status |
|------|------------------------------|--------|
| Homepage | X | — |
| Top pillar pages | X | Should be high |
| Key landing pages | X | Should be high |
| Orphaned pages | 0 | ❌ Fix |

**Action:** Pages with high organic potential but low internal links = quick win.

---

## Section 3: Core Web Vitals

Source: GSC → Core Web Vitals report (field data) or PageSpeed Insights.

| Metric | Mobile | Desktop | Target | Status |
|--------|--------|---------|--------|--------|
| LCP | X.Xs | X.Xs | <2.5s | ✅/❌ |
| INP | Xms | Xms | <200ms | ✅/❌ |
| CLS | X.XX | X.XX | <0.1 | ✅/❌ |

### Common Fixes by Metric:
**LCP issues:**
- Largest element not preloaded → add `<link rel="preload">`
- Slow server response → improve TTFB, use CDN
- Render-blocking resources → defer non-critical JS/CSS
- Unoptimized images → convert to WebP, add explicit dimensions

**INP issues:**
- Heavy JavaScript execution → code splitting, lazy loading
- Long tasks blocking main thread → break up JS tasks

**CLS issues:**
- Images without dimensions → always set width + height
- Late-loading ads/embeds → reserve space
- Web fonts causing layout shift → `font-display: swap` + preload

---

## Section 4: Structured Data

| Schema Type | Present | Errors | Opportunity |
|-------------|---------|--------|-------------|
| Organization | ✅/❌ | X | Required for Knowledge Panel |
| Article/BlogPosting | ✅/❌ | X | Rich results eligibility |
| Product | ✅/❌ | X | Price/rating in SERP |
| FAQ | ✅/❌ | X | PAA expansion in SERP |
| HowTo | ✅/❌ | X | Step-by-step rich result |
| Breadcrumb | ✅/❌ | X | SERP URL display |
| LocalBusiness | ✅/❌ | X | Map pack eligibility |

Validation tool: [Rich Results Test](https://search.google.com/test/rich-results)

---

## Section 5: HTTPS & Security

### 5.1 HTTPS Status
- [ ] All pages served over HTTPS (no HTTP pages)
- [ ] SSL certificate valid + not expiring within 30 days
- [ ] HSTS header present (`Strict-Transport-Security`)
- [ ] HTTP → HTTPS redirect working (301, not 302)
- [ ] WWW vs non-WWW: one version redirects to the other (pick one canonical)

### 5.2 Mixed Content Audit
Mixed content = HTTPS page loading HTTP resources (images, scripts, CSS).
Browsers block or warn on mixed content → breaks UX + signals.

**How to find:**
- Chrome DevTools → Console → look for "Mixed Content" warnings
- Screaming Frog → Response Codes → filter HTTP resources on HTTPS pages
- Why No Padlock tool: `whynopadlock.com`

| Resource Type | URL | Page Found On | Fix |
|---------------|-----|--------------|-----|
| Image | http://... | /page-x | Update src to https:// |
| Script | http://... | /page-y | Update or remove |
| CSS | http://... | /page-z | Update to https:// |

**Common causes:**
- Hardcoded `http://` in content/theme files
- Old media uploads with HTTP URLs in database
- Third-party embeds still serving HTTP

**Fix for WordPress:** Search-replace `http://yourdomain.com` → `https://yourdomain.com` in DB using Better Search Replace plugin.

---

## Section 6: Pagination Handling

### Background: rel=next/prev is deprecated
Google deprecated `rel=next/prev` in 2019. It no longer passes signals between paginated pages.

### Current Best Practices (2024-2025)

**For Blog / Article Archives:**
- Each paginated page should be indexable with self-referencing canonical
- Do NOT canonical all pages to page 1 (hides content from index)
- Use descriptive page titles: "Blog - Page 2" is weak → consider filtering by topic instead

**For Ecommerce Category Pages:**
- Page 1: Full optimization (title, meta, H1, content)
- Pages 2+: Indexable, self-canonical, but no duplicate title/meta
- Add "View All" option if product count allows (<200 products) — consolidates signals

**For Large Catalogs (500+ products per category):**
- Consider infinite scroll with History API (pushState) — keeps URLs crawlable
- Or: Use filtering/facets instead of pagination for better UX + SEO

### Pagination Audit Checklist
- [ ] No canonical from page 2+ pointing to page 1
- [ ] Each paginated URL is self-canonicalized
- [ ] Page 2+ not accidentally noindexed
- [ ] Internal links to deeper pages exist (not just prev/next)
- [ ] Paginated pages in sitemap? (Only include if they have unique indexable value)
- [ ] "View All" page exists for small catalogs?

| Paginated URL | Canonical | Indexed? | In Sitemap | Status |
|---------------|-----------|----------|------------|--------|
| /category?page=2 | Self | Yes | Yes | ✅ |
| /category?page=3 | /category | Yes | Yes | ❌ Fix canonical |

---

## Section 7: Hreflang Audit (Multilingual Sites Only)

Skip this section if the site is single-language.

### What Hreflang Does
Tells Google which language/region version of a page to show to which user.
Without it: Google may show the wrong language version → high bounce rate.

### Hreflang Implementation Methods
| Method | Where | Best For |
|--------|-------|----------|
| HTML `<head>` tag | Each page's `<head>` | Small-medium sites |
| XML Sitemap | Sitemap file | Large sites (faster to manage) |
| HTTP Header | Server response | PDFs, non-HTML files |

### Hreflang Tag Format
```html
<link rel="alternate" hreflang="en" href="https://example.com/page/" />
<link rel="alternate" hreflang="ar" href="https://example.com/ar/page/" />
<link rel="alternate" hreflang="x-default" href="https://example.com/page/" />
```
- `x-default` = fallback for users whose language isn't listed
- Every page must reference ALL its language variants (including itself)
- Must be reciprocal: if EN page points to AR page → AR page must point back to EN

### Hreflang Audit Checklist
- [ ] All language versions covered (including x-default)
- [ ] Tags are reciprocal (both directions)
- [ ] URLs in hreflang tags are canonical URLs (not redirects)
- [ ] Language codes use ISO 639-1 format (`en`, `ar`, `fr`)
- [ ] Region codes use ISO 3166-1 format when needed (`en-gb`, `en-us`, `ar-sa`)
- [ ] No hreflang pointing to 404 or redirected URLs
- [ ] Consistent implementation across all pages (not just homepage)

### Common Hreflang Errors
| Error | Impact | Fix |
|-------|--------|-----|
| Missing x-default | Wrong page shown to unmatched users | Add x-default tag |
| Non-reciprocal tags | Google ignores the tag | Add reverse tags |
| Wrong language code | Wrong users targeted | Use correct ISO codes |
| Hreflang on noindex page | Confusion signal | Remove noindex or remove hreflang |
| URL mismatch (http vs https) | Tag ignored | Normalize all URLs to canonical form |

**Validation tools:**
- Ahrefs → Site Audit → Hreflang
- Screaming Frog → Hreflang tab
- hreflang Tags Testing Tool: `hreflangchecker.com`

---

## Section 8: Log File Analysis (If Hosting Access Available)

### What Log Files Tell You (That GSC Can't)
- Exactly which pages Googlebot crawled and when
- Crawl frequency per page type
- Crawl waste (bot crawling URLs you don't want crawled)
- Real crawl budget distribution vs. your intended priority

### How to Get Log Files
- Apache: `/var/log/apache2/access.log`
- Nginx: `/var/log/nginx/access.log`
- Hosting panels: cPanel → Logs → Raw Access
- Cloudflare: Logpush (Enterprise) or Workers logs

### Filter for Googlebot Only
```bash
grep "Googlebot" access.log > googlebot_only.log
```

### Key Analysis Metrics

**Crawl Frequency Table:**
| Page Type | Crawls/Month | Should Be | Status |
|-----------|-------------|-----------|--------|
| Homepage | X | High (daily) | ✅/⚠️ |
| Pillar pages | X | High (weekly) | ✅/⚠️ |
| Product pages | X | Medium | ✅/⚠️ |
| Parameter URLs | X | 0 (waste) | ❌ |
| Noindex pages | X | 0 (waste) | ❌ |
| 404 pages | X | 0 (waste) | ❌ |

**Crawl Waste Signals:**
- Googlebot hitting parameter URLs (`?sort=price&color=red`) → add to robots.txt or use canonical
- Crawling paginated pages beyond page 5 but not crawling new content → internal linking issue
- High crawl rate on thin/duplicate pages → content consolidation needed

### Log File Interpretation Rules
- New content not crawled within 2 weeks → crawl budget or internal linking issue
- Important pages crawled < once/month → increase internal links to those pages
- Crawl rate dropped suddenly → could signal a penalty or site quality issue

---

## Section 9: Technical Issues Priority Matrix

| Issue | Impact | Effort | Priority |
|-------|--------|--------|----------|
| HTTP pages / no HTTPS redirect | High | Low | 🔴 Immediate |
| Mixed content on HTTPS pages | High | Low | 🔴 Immediate |
| 404 pages with backlinks | High | Low | 🔴 Immediate |
| Missing canonical tags | High | Low | 🔴 Immediate |
| Wrong pagination canonicals | High | Low | 🔴 Immediate |
| Hreflang non-reciprocal tags | High | Medium | 🔴 Immediate |
| Missing sitemap | High | Low | 🔴 Immediate |
| Redirect chains (3+) | Medium | Low | 🟡 This sprint |
| Crawl waste (parameters, noindex) | Medium | Low | 🟡 This sprint |
| Orphaned pages | Medium | Medium | 🟡 This sprint |
| CWV failing on mobile | High | High | 🟡 Plan sprint |
| Missing structured data | Medium | Medium | 🟢 Next sprint |
| Thin content pages | Medium | High | 🟢 Next sprint |

---

## Deliverable Format
When presenting audit results:
1. **Critical Issues** (fix this week) — table with URL + issue + fix
2. **Quick Wins** (fix this month) — bullet list
3. **Roadmap Items** (next quarter) — prioritized backlog