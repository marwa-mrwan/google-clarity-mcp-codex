# Cannibalization Audit Framework

## When to Run This
- Before ANY title tag, H1, or meta description change
- When organic traffic drops unexpectedly on a topic
- When launching new content in an existing topic cluster
- When two pages seem to compete for the same rankings

---

## Step 1: Data Collection

### GSC Query (via MCP or manual export)
Dimensions needed: `page` + `query`
Filters:
- Date range: Last 3 months (minimum)
- Impressions: >10 (filter noise)

If using MCP:
```
Request: GSC performance data
Dimensions: page, query
Date range: last 90 days
Min impressions: 10
```

If manual: Export from GSC → Performance → Pages → Click any page → Queries tab

---

## Step 2: Conflict Detection

### Cannibalization Signal Checklist
Flag a conflict when ALL of these are true:
- [ ] 2+ pages ranking for the same query
- [ ] Both pages appear in positions 1–20
- [ ] Combined clicks are split (no clear winner)
- [ ] Neither page is winning consistently

### Conflict Map Table

| Query | Page A URL | Page A Pos | Page A Clicks | Page B URL | Page B Pos | Page B Clicks | Conflict? |
|-------|-----------|-----------|--------------|-----------|-----------|--------------|-----------|
| [kw] | /page-a | X.X | XX | /page-b | X.X | XX | YES/NO |

**Conflict scoring:**
- 🔴 Active: Both pages in top 10, clicks nearly equal
- 🟡 Emerging: One page positions 1–10, other 11–20
- 🟢 Resolved: One page dominates >80% of clicks

---

## Step 3: Ownership Assignment

**Rules for assigning the owner page:**
1. Page with most clicks on that query = current winner
2. Page whose topic is the closest semantic match = should be owner
3. If different → migration needed

| Query | Current Winner | Correct Owner | Match? | Action |
|-------|---------------|--------------|--------|--------|
| [kw] | /page-a | /page-b | No | Migrate |
| [kw] | /page-a | /page-a | Yes | Protect |

---

## Step 4: Resolution Playbook

### Option A: De-optimize the Losing Page
Use when: The wrong page is winning but the right page exists.
Actions:
- Remove/dilute the competing keyword from non-owner page's title + H1
- Add internal link from non-owner → owner page using the target keyword as anchor text
- Do NOT noindex the non-owner (it may rank for other terms)

### Option B: Consolidate (Merge)
Use when: Two pages cover the same topic with thin content.
Actions:
- Merge content into one stronger page
- 301 redirect the weaker URL → stronger URL
- Update all internal links
- Submit updated sitemap

### Option C: Differentiate
Use when: Both pages have strong signals but target slightly different intents.
Actions:
- Clearly differentiate the angle: one targets informational, one transactional
- Update title + H1 to reflect distinct intent
- Add canonical tags (self-referencing on both)
- Strengthen internal links to make intent clear

### Option D: Redirect + Archive
Use when: One page is clearly inferior and has no unique value.
Actions:
- 301 redirect weak → strong
- Remove from sitemap
- Monitor rankings for 4–6 weeks

---

## Step 5: Prevention Rules

**Title Tag Rules:**
- No two pages in the same cluster share the same primary keyword in the title
- Pillar page owns the head term
- Satellites target long-tail variations only

**H1 Rules:**
- Must match title intent (can be slightly longer)
- Never duplicate H1 across pages

**Internal Link Rules:**
- Always link to the designated owner page when mentioning a topic
- Anchor text must use the exact target keyword of the owner page

---

## Parameter-Based Cannibalization (Ecommerce / Faceted Navigation)

### The Problem
Ecommerce sites with faceted navigation generate hundreds of URL variations for the same category:
```
/shoes/running/                    ← canonical category
/shoes/running/?color=red          ← color filter
/shoes/running/?size=42            ← size filter
/shoes/running/?color=red&size=42  ← combined filter
/shoes/running/?sort=price-asc     ← sort order
```
Each of these is a unique URL — Google may index all of them, splitting authority and creating cannibalization at scale.

### Detection
- GSC: filter by URL → look for `?` parameter URLs getting impressions
- Screaming Frog: crawl with "Crawl all URLs" → filter by `?` in URL
- GSC Coverage: high number of "Duplicate without canonical" = parameter problem

### Solution Matrix
| Parameter Type | SEO Value | Action |
|---------------|-----------|--------|
| Filters (color, size, brand) | None — duplicate content | Canonical → clean URL OR noindex |
| Sort order (`?sort=price`) | None | Noindex + disallow in robots.txt |
| Pagination (`?page=2`) | Some — unique products | Self-canonical, keep indexable |
| Search queries (`?q=shoes`) | None | Noindex + disallow |
| Tracking params (`?utm_source`) | None | Canonical → clean URL |
| Meaningful facets (e.g. `/shoes/red/`) | Potential — if search volume | Treat as real page, full optimization |

### Implementation Options (Pick One Per Site)
**Option A — Canonical tags (preferred for most)**
Add `<link rel="canonical" href="/shoes/running/">` to all parameter variants.
Pros: Simple, doesn't affect user experience.
Cons: Google may not always respect canonicals.

**Option B — Robots.txt disallow**
Block parameter URLs from crawling entirely.
```
Disallow: /*?sort=
Disallow: /*?color=
```
Pros: Stops crawl waste immediately.
Cons: If any parameter page has backlinks, you lose them.

**Option C — URL structure (cleanest, hardest to implement)**
Use clean URLs for valuable facets: `/shoes/running/red/` instead of `?color=red`
Treat as real pages with full optimization.
Reserve for facets with proven search demand only.

### GSC Parameter Handling
If site uses Google Search Console's URL Parameters tool (Legacy):
- Flag sort/filter/session parameters as "Doesn't affect page content" → Google ignores them
- Note: This tool is being deprecated — canonical tags are the more future-proof solution

---

## Mobile vs Desktop Cannibalization

### When This Happens (Rare but Real)
Google primarily uses mobile indexing. In rare cases, a page may rank differently on mobile vs desktop — usually caused by:
- Different content served to mobile vs desktop (dynamic serving)
- Mobile page having different canonical than desktop
- AMP pages creating a separate URL competing with canonical

### Detection
GSC doesn't split rankings by device by default, but you can approximate:
1. GSC → Performance → Device → Compare Mobile vs Desktop
2. Look for queries where:
   - Mobile: Position 15+, low clicks
   - Desktop: Position 3, high clicks
   - Same query, same intent → investigate

### Common Causes & Fixes
| Cause | Detection | Fix |
|-------|-----------|-----|
| Dynamic serving (different HTML per device) | Check response headers for `Vary: User-Agent` | Migrate to responsive design |
| AMP page competing with canonical | Search `amp` in GSC URLs | Ensure AMP has `<link rel="canonical">` pointing to main page |
| Mobile canonical differs from desktop | Crawl both user agents | Align canonicals across all versions |
| Mobile page missing key content | Compare rendered HTML on mobile vs desktop | Move content out of JS that doesn't render on mobile |

### Prevention Rule
Always use responsive design (one URL, CSS adapts layout).
Dynamic serving and separate mobile URLs (`m.domain.com`) create complexity and cannibalization risk.

---

## Cannibalization Audit Sign-Off Checklist
Before proceeding to any on-page changes:
- [ ] Cross-page query map completed for all target keywords
- [ ] Owner page assigned for every conflicting query
- [ ] Resolution plan documented for each conflict
- [ ] Title/H1 deconfliction verified
- [ ] No two pages share the same primary keyword
- [ ] Parameter URLs audited (ecommerce sites)
- [ ] Canonical tags consistent across mobile/desktop versions
- [ ] No AMP pages competing with canonical URLs