# Keyword Research Framework

## When to Use
- Starting a new content strategy
- Expanding into a new topic cluster
- Identifying quick wins from existing rankings
- Competitive gap analysis

---

## Phase 1: Seed Keywords

### Collection Sources (in priority order)
1. **GSC "Queries" report** — keywords already driving impressions (positions 4–20 = quick wins)
2. **Competitor analysis** — top 5 organic competitors, their top pages
3. **User language** — support tickets, reviews, community forums
4. **Autocomplete signals** — Google Search, YouTube, Reddit, Quora
5. **Keyword tools** — Ahrefs, Semrush, Google Keyword Planner

### Seed Keyword Capture Table
| Seed Keyword | Source | Initial Volume Est. | Notes |
|-------------|--------|-------------------|-------|
| [keyword] | GSC | X,XXX | Current pos: XX |

---

## Phase 2: Intent Classification

Every keyword must be classified before targeting:

| Intent Type | Signal Words | Content Format | Funnel Stage |
|-------------|-------------|----------------|-------------|
| Informational | how, what, why, guide, tips | Blog post, guide, tutorial | Top |
| Commercial | best, vs, review, compare, top | Comparison, listicle, review | Mid |
| Transactional | buy, price, discount, order, hire | Landing page, product page | Bottom |
| Navigational | brand name, login, [brand] + feature | Homepage, feature page | Any |

**Rule:** Never target transactional intent with informational content or vice versa.

---

## Phase 3: Topic Cluster Architecture

### Cluster Structure
```
Pillar Page (head term — broad, high volume)
    ├── Satellite 1 (long-tail — informational)
    ├── Satellite 2 (long-tail — commercial)
    ├── Satellite 3 (long-tail — specific subtopic)
    └── Satellite 4 (long-tail — FAQ/how-to)
```

**Rules:**
- One pillar page per topic cluster
- Each satellite links back to the pillar
- Pillar links out to all satellites
- No satellite targets the pillar's primary keyword

### Cluster Mapping Table
| Page Role | Target Keyword | Volume | KD | Intent | URL | Status |
|-----------|---------------|--------|----|--------|-----|--------|
| Pillar | [head term] | X,XXX | XX | Info/Commercial | /pillar | Exists/New |
| Satellite 1 | [long-tail] | XXX | XX | Informational | /blog/post-1 | Exists/New |
| Satellite 2 | [long-tail] | XXX | XX | Commercial | /compare/x-vs-y | New |

---

## Phase 4: Prioritization Matrix

Score each keyword opportunity:

| Factor | Weight | How to Score |
|--------|--------|-------------|
| Search Volume | 30% | High >1k=3, Mid 100-1k=2, Low <100=1 |
| Keyword Difficulty | 25% | Easy <30=3, Medium 30-60=2, Hard >60=1 |
| Current Position | 25% | 1-3=3 (protect), 4-20=3 (quick win), 21+=1 |
| Business Value | 20% | High conversion intent=3, Low=1 |

**Priority Score = weighted average**
- Score 2.5–3.0 → 🔴 Immediate priority
- Score 1.5–2.4 → 🟡 Next sprint
- Score <1.5 → 🟢 Backlog

---

## Phase 5: SERP Feature Opportunities

For high-priority keywords, check SERP features present:

| Keyword | Featured Snippet | PAA | Video | Images | Local Pack | Our Status |
|---------|-----------------|-----|-------|--------|------------|------------|
| [kw] | Yes/No | Yes/No | Yes/No | Yes/No | Yes/No | Ranking/Not |

### How to Target Each Feature:
**Featured Snippet:**
- Answer the question directly in the first paragraph (40–60 words)
- Use the keyword in an H2 as a question
- Format as: definition → explanation → example

**People Also Ask (PAA):**
- Add H2/H3 subheadings phrased as exact PAA questions
- Follow with concise 2–4 sentence answer
- Add FAQ schema markup

**Video:**
- Create video content on the topic
- Embed on the page with VideoObject schema
- Optimize video title to match keyword

---

## Phase 6: Content Gap Analysis

### Template: Gaps vs Competitors
| Keyword | Competitor Ranking | Our Status | Gap Type | Priority |
|---------|-------------------|-----------|----------|----------|
| [kw] | Competitor A — pos 2 | Not ranking | Missing content | High |
| [kw] | Competitor B — pos 5 | Pos 18 | Weak content | High |
| [kw] | Competitor C — pos 3 | Pos 12 | Cannibalization | Medium |

### Gap Types:
- **Missing content** → Create new page
- **Weak content** → Expand + optimize existing page
- **Cannibalization** → Run cannibalization audit first
- **Wrong intent** → Rewrite with correct format

---

## Quick Wins Identification (GSC-Based)

Pull from GSC → Performance → filter by position 4–20:

| Query | Current Position | Impressions | Clicks | CTR | Action |
|-------|-----------------|-------------|--------|-----|--------|
| [kw] | 6 | X,XXX | XX | X% | Optimize title + H1 + add internal links |
| [kw] | 12 | XXX | X | X% | Expand content depth |
| [kw] | 18 | XXX | X | X% | Check cannibalization first |

**These are the highest ROI actions** — the page is already indexed and getting impressions.

---

## Brand vs Non-Brand Split Analysis

### Why This Matters
Brand traffic (people searching your name) inflates SEO health metrics.
Non-brand traffic = real SEO performance.
A site with 80% branded traffic can look "healthy" in GSC while actual SEO is weak.

### How to Segment in GSC
GSC → Performance → Queries → Filter: "Query does not contain [brand name]"
Compare: total traffic vs non-brand traffic.

### Health Benchmarks
| Brand Traffic % | Interpretation |
|----------------|----------------|
| <20% | Strong organic SEO — most traffic from non-brand |
| 20–50% | Balanced — monitor non-brand growth trend |
| 50–80% | Heavy brand dependency — SEO opportunity is large |
| >80% | Almost no SEO presence — start from scratch strategy |

### Tracking Table (Pull Monthly)
| Month | Total Clicks | Brand Clicks | Non-Brand Clicks | Non-Brand % | Trend |
|-------|-------------|-------------|-----------------|------------|-------|
| Jan | X,XXX | XXX | X,XXX | XX% | — |
| Feb | X,XXX | XXX | X,XXX | XX% | ↑/↓ |

**Goal:** Non-brand % should grow month-over-month as SEO matures.

### Branded Keyword Strategy (Separate from SEO KPIs)
- Brand keywords: protect with homepage + brand page optimization
- Brand + modifier (e.g. "BrandName pricing", "BrandName vs X"): create dedicated pages
- Competitor brand terms: commercial intent, handle carefully (comparison content)

---

## Seasonal Keyword Patterns

### Why It Matters
Targeting a seasonal keyword at the wrong time = wasted effort.
Publishing content 2–3 months before peak = correct timing (Google needs time to index + rank).

### How to Identify Seasonal Keywords
1. Google Trends: compare 12-month pattern — flat = evergreen, spiky = seasonal
2. GSC: pull impressions by month for existing keywords — look for recurring spikes
3. Keyword tool "monthly breakdown" feature (Ahrefs / Semrush show volume per month)

### Seasonal Pattern Types
| Pattern | Description | Strategy |
|---------|-------------|----------|
| Annual spike | Peaks same month each year | Publish/update 8 weeks before peak |
| Holiday-driven | Christmas, Ramadan, Black Friday | Evergreen URL, update content annually |
| News-driven | Unpredictable — tied to events | Monitor with Google Alerts, react fast |
| Academic | Back to school, exam season | Calendar-based content planning |
| Weather | Summer/winter products | Plan by hemisphere if international |

### Seasonal Content Calendar Template
| Keyword | Peak Month | Publish/Update By | Current Status | Owner Page |
|---------|-----------|------------------|----------------|------------|
| [kw] | December | October 1 | Exists / New | /page-url |

### Rule: Evergreen URLs for Seasonal Content
- Use: `/best-ramadan-deals/` (no year in URL)
- Not: `/best-ramadan-deals-2025/` (creates new URL each year = restart authority)
- Update the content annually, keep the URL permanent

---

## Zero-Click Keywords

### Definition
Keywords where Google answers the query directly in the SERP (Featured Snippet, Knowledge Panel, Calculator, etc.) — users get the answer without clicking.

### Should You Still Target Zero-Click Keywords?
**Sometimes yes, sometimes no:**

| Scenario | Target? | Reason |
|----------|---------|--------|
| Featured snippet with "See more" | Yes | Still drives brand awareness + some clicks |
| Calculator / converter result | No | Google shows the answer inline — no click value |
| Knowledge panel for a brand | Yes | Own your entity — build structured data |
| Definition boxes | Yes | Establishes topical authority even with low CTR |
| Local pack results | Yes | Drives calls/directions even without website click |

### How to Identify Zero-Click Keywords in Your Niche
1. Run target keyword in Google — does the answer appear without clicking?
2. GSC: high impressions + very low CTR (<1%) on informational queries = likely zero-click
3. Ahrefs: "SERP Features" column — "Featured snippet" + your site not owning it

### Zero-Click Keyword Decision Framework
```
Is there a featured snippet?
    ├── Yes, we own it → Keep optimizing for authority signal
    ├── Yes, competitor owns it → Can we steal it? (reformat content)
    └── No snippet yet → Opportunity to create one (format content correctly)

Is CTR < 0.5% despite top 3 position?
    ├── Yes → Zero-click keyword — deprioritize, use for topical authority only
    └── No → Normal keyword — optimize for clicks