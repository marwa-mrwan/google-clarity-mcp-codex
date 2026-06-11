# Link Building Playbook

## Core Principle
Every link acquisition tactic must be white-hat.
No link schemes, paid links (undisclosed), PBNs, or reciprocal link exchanges.
Links should be earned because the content deserves them.

---

## Phase 1: Link Profile Audit

### Current State Assessment
Before building, understand what you have:

| Metric | Value | Benchmark | Status |
|--------|-------|-----------|--------|
| Domain Rating (Ahrefs) / DA (Moz) | XX | Competitors avg | ✅/⚠️ |
| Total referring domains | X,XXX | — | — |
| Referring domains — DR 50+ | XXX | >20% of total | ✅/⚠️ |
| Toxic/spammy links | X% | <5% | ✅/❌ |
| Lost links (last 90 days) | XX | — | Monitor |

### Link Quality Distribution
| Quality Tier | DR Range | % of Profile | Ideal % |
|-------------|----------|-------------|---------|
| High authority | DR 70+ | X% | >15% |
| Mid authority | DR 40–69 | X% | >40% |
| Low authority | DR 10–39 | X% | <40% |
| Toxic | DR <10 or spam | X% | <5% |

**If toxic links >5%:** Build disavow file before new link building.

---

## Phase 2: Competitor Link Gap

### Process
1. Pull top 5 organic competitors' referring domains
2. Find domains linking to 2+ competitors but NOT to your site
3. Prioritize: DR 50+, relevant niche, real traffic

### Gap Table
| Referring Domain | DR | Links to Competitor A | Links to Competitor B | Links to Us | Opportunity |
|-----------------|----|--------------------|--------------------|-----------|-----------| 
| example.com | 72 | ✅ | ✅ | ❌ | High |

**These are your highest-probability targets** — they've already linked to your competitors, so they're proven linkers in your niche.

---

## Phase 3: Link Acquisition Tactics

### Tactic 1: Digital PR (Highest Quality Links)
**Target:** DR 60+ news sites, industry publications
**Volume:** 5–15 links/campaign
**Timeline:** 4–8 weeks per campaign

**Content types that earn PR links:**
- Original research / surveys with surprising data
- Industry reports (annual benchmarks, state of the industry)
- Data-driven rankings ("Top X cities for Y")
- Reactive expert commentary on trending news

**Process:**
1. Identify trending story in your niche
2. Create unique data angle or expert quote
3. Find journalists covering that beat (Google News + LinkedIn)
4. Send personalized pitch (not mass email) — subject line = the story angle
5. Follow up once after 3 business days

**Pitch Template:**
```
Subject: [Data/Insight] — [Relevant to their beat]

Hi [Name],

I noticed you covered [their recent article]. 

We just published [data/research] showing [surprising finding].

Key stat: [one number that's surprising]

Happy to send the full dataset or provide a quote if useful.

[Name]
```

---

### Tactic 2: Broken Link Reclamation
**Target:** DR 40+ sites in your niche
**Volume:** 5–10 links/month
**Timeline:** Ongoing

**Process:**
1. Find resource pages in your niche (`[topic] + "useful resources"` / `"recommended links"`)
2. Check all links on those pages for 404s (use Check My Links browser extension)
3. Find the dead link's original content (Wayback Machine)
4. Create equivalent or better content on your site
5. Email the site owner: "Hey, your link to X is broken — we have updated content here"

**Email Template:**
```
Subject: Broken link on your [page name]

Hi [Name],

Quick heads up — the link to [anchor text] on your [page URL] 
is returning a 404.

We have an updated resource covering the same topic: [your URL]

Might be a useful replacement for your readers.

[Name]
```

---

### Tactic 3: Unlinked Brand Mentions
**Target:** Any site mentioning your brand without linking
**Volume:** Variable — depends on brand visibility
**Timeline:** Ongoing monitoring

**Process:**
1. Set up Google Alerts for brand name + key product names
2. Use Ahrefs Alerts or Mention.com for comprehensive monitoring
3. When mention found without link → email requesting link addition
4. Frame as: "adding the link helps their readers find more info"

---

### Tactic 4: Resource Page Link Building
**Target:** DR 40+ curated resource lists in your niche
**Volume:** 8–12 links/month
**Timeline:** Ongoing

**Finding resource pages:**
- `[topic] + "useful resources"`
- `[topic] + "recommended links"`
- `[topic] + inurl:resources`
- `[topic] + "helpful links"`

**Qualification criteria:**
- Page is actively maintained (updated in last 12 months)
- Site DR ≥ 40
- Topically relevant to your content
- Links are editorial (not paid)

---

### Tactic 5: HARO / Connectively (Expert Commentary)
**Target:** DR 50+ media publications
**Volume:** 5–10 links/month (from 20–40 pitches)
**Timeline:** Ongoing

**Process:**
1. Sign up at connectively.us (formerly HARO)
2. Monitor daily emails for queries in your niche
3. Respond within 2–4 hours (speed matters)
4. Keep response: 100–200 words, lead with the answer, add credentials

**Response Format:**
```
[Direct answer to their question in 2-3 sentences]

[Supporting reasoning or data]

[One practical tip or example]

Bio: [Name], [Title] at [Company]. [1 relevant credential].
```

---

## Phase 4: Linkable Asset Creation

Create content specifically designed to attract links:

| Asset Type | Link Potential | Effort | Examples |
|------------|---------------|--------|---------|
| Original research/survey | Very High | High | Industry benchmarks, annual reports |
| Free tool / calculator | Very High | High | ROI calculator, audit tool |
| Definitive guide | High | High | Complete guide to X |
| Data visualization | High | Medium | Interactive infographic |
| Case study with data | Medium | Medium | "How we grew X by Y%" |
| Expert roundup | Medium | Low | "15 experts on X" |
| Statistics page | High | Low | "X statistics for 2025" |

**Statistics pages deserve special mention:**
- Journalists need data to cite → they link to statistics pages
- Format: `[topic] + statistics + [year]`
- Curate 20–40 stats with sources
- Update annually
- Internal link from all related content

---

## Phase 5: Monthly Tracking

| Metric | Month 1 | Month 2 | Month 3 | Target |
|--------|---------|---------|---------|--------|
| New referring domains | X | X | X | +10–20/month |
| Lost referring domains | X | X | X | Minimize |
| Net referring domain growth | X | X | X | Positive |
| DR/DA change | X | X | X | +1–2/quarter |
| Links from DR 50+ | X | X | X | >40% of new |

**Rule:** Focus on referring domains (unique sites), not total backlinks.
1000 links from 1 site = far less value than 100 links from 100 sites.

---

## Disavow File Guidelines

**Build a disavow file when:**
- Site-wide links from clearly spammy domains
- Links with manipulative anchor text (exact-match commercial keywords at scale)
- Links from link farms, PBNs, or adult/gambling sites (if irrelevant)
- Toxic link ratio >5%

**Disavow format:**
```
# Disavow file — [Site] — Updated [Date]
# Spammy domains
domain:spammydomain.com
domain:linkfarm-example.net
```

Upload via: GSC → Legacy tools → Disavow links

**Warning:** Disavow is a last resort. Do not disavow legitimate low-DR links.