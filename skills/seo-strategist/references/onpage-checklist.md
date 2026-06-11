# On-Page SEO Optimization Checklist

## When to Use
- Optimizing an existing page that's underperforming
- Publishing new content
- After cannibalization audit is complete (BLOCKER)

---

## Pre-Optimization Requirements
- [ ] Cannibalization audit completed for target keyword
- [ ] Owner page confirmed (this page = designated owner)
- [ ] Competitor top 5 pages reviewed for this keyword
- [ ] Search intent confirmed (Informational / Commercial / Transactional)

---

## Section 1: Meta Tags

### Title Tag
- [ ] Includes primary keyword (preferably at the start)
- [ ] 50–60 characters (not truncated in SERP)
- [ ] Includes a modifier when relevant (year, "guide", "free", etc.)
- [ ] Matches search intent of the keyword
- [ ] Does NOT duplicate title of any other page in cluster
- [ ] Format: `[Primary Keyword] — [Modifier] | [Brand]`

**Examples:**
- ✅ `Technical SEO Audit Guide 2025 | SiteName`
- ❌ `Welcome to Our Website | SiteName` (no keyword)
- ❌ Same title as another page in the cluster

### Meta Description
- [ ] 150–160 characters
- [ ] Includes primary keyword naturally
- [ ] Has a clear value proposition or CTA
- [ ] Not auto-generated / duplicate
- [ ] Does NOT repeat the title verbatim

### Canonical Tag
- [ ] Self-referencing canonical on this page
- [ ] No cross-canonicals pointing to other pages (unless intentional merge)
- [ ] Canonical URL = exact URL (including/excluding trailing slash — be consistent)

### Open Graph Tags
- [ ] `og:title` set
- [ ] `og:description` set (can differ from meta description)
- [ ] `og:image` set (1200x630px minimum)
- [ ] `og:url` matches canonical

---

## Section 2: Content Structure

### H1
- [ ] Single H1 per page (only one)
- [ ] Includes primary keyword
- [ ] Matches search intent
- [ ] Does NOT duplicate H1 of another page in the cluster
- [ ] 50–70 characters ideal

### Heading Hierarchy
- [ ] H2s cover main subtopics (include secondary keywords naturally)
- [ ] H3s are used for subsections under H2s
- [ ] At least one H2 is phrased as the exact PAA question for the topic
- [ ] Headings form a logical outline (not randomly nested)

### Content Quality
- [ ] Primary keyword appears in first 100 words
- [ ] Word count competitive with top 5 ranking pages (±20%)
- [ ] Covers all subtopics that competitors cover (check their H2/H3)
- [ ] Contains unique insight, data, or angle not in competitor content (E-E-A-T)
- [ ] Reading level appropriate for target audience

### E-E-A-T Signals
- [ ] Author bio with credentials (for YMYL topics: health, finance, legal)
- [ ] Publication date + last updated date visible
- [ ] External citations to authoritative sources (gov, academic, industry leaders)
- [ ] First-person experience or case data where relevant

---

## Section 3: Internal Linking

### From This Page
- [ ] Links to pillar page (if this is a satellite)
- [ ] Links to 2–4 related satellite pages in the cluster
- [ ] Anchor text is descriptive (not "click here" or "read more")
- [ ] No exact-match anchor spam (vary naturally)

### To This Page
- [ ] At least 3 internal links pointing to this page from related content
- [ ] Anchor text of incoming links includes target keyword
- [ ] Pillar page links to this page (if it's a satellite)
- [ ] Check orphaned status — 0 internal links = invisible to crawlers

---

## Section 4: Images & Media

### Images
- [ ] All images have descriptive alt text (includes keyword where natural)
- [ ] File names are descriptive (`technical-seo-audit.webp` not `IMG_001.webp`)
- [ ] Format: WebP or AVIF (not JPG/PNG unless necessary)
- [ ] File size: <100KB per image (compress if needed)
- [ ] Width + height attributes set (prevents CLS)
- [ ] Hero/above-fold image has `loading="eager"` (not lazy)
- [ ] Below-fold images have `loading="lazy"`

### Video (if applicable)
- [ ] Embedded with VideoObject schema markup
- [ ] Video title matches target keyword
- [ ] Transcript available on page (accessibility + indexation)

---

## Section 5: Schema Markup

Choose schema based on page type:

| Page Type | Primary Schema | Additional Schema |
|-----------|---------------|------------------|
| Blog post / Guide | Article or BlogPosting | FAQ, HowTo, BreadcrumbList |
| Product page | Product | Review, Offer, BreadcrumbList |
| Category/landing | WebPage | BreadcrumbList, FAQPage |
| Local business | LocalBusiness | OpeningHours, GeoCoordinates |
| How-to guide | HowTo | FAQPage, BreadcrumbList |

**Checklist:**
- [ ] Primary schema implemented and validated
- [ ] BreadcrumbList schema added (reflects URL hierarchy)
- [ ] FAQ schema added if page has Q&A section
- [ ] Author schema with credentials (for E-E-A-T)
- [ ] Validated via [Rich Results Test](https://search.google.com/test/rich-results)
- [ ] No validation errors in Rich Results Test

---

## Section 6: Technical On-Page

- [ ] Page loads in <2.5s LCP (check PageSpeed Insights)
- [ ] No render-blocking resources above the fold
- [ ] Mobile-friendly (passes Google Mobile-Friendly Test)
- [ ] HTTPS (not HTTP)
- [ ] No mixed content warnings
- [ ] URL is clean, lowercase, uses hyphens (not underscores)
- [ ] URL length <75 characters
- [ ] No keyword stuffing in URL (1–2 words max)

---

## Section 7: SERP Feature Optimization

### Featured Snippet Targeting
If SERP shows a featured snippet for target keyword:
- [ ] Add a concise 40–60 word definition/answer directly answering the query
- [ ] Place it immediately after the relevant H2
- [ ] Use the same question phrasing as the H2

### People Also Ask
- [ ] Identify top 3–5 PAA questions for target keyword
- [ ] Add as H2 or H3 subheadings
- [ ] Answer each in 2–4 sentences
- [ ] Apply FAQ schema to these Q&A sections

---

## Post-Optimization Actions
- [ ] Submit URL to GSC for re-indexing (URL Inspection → Request Indexing)
- [ ] Update internal links from related pages (add links pointing to this page)
- [ ] Note optimization date for tracking ranking changes
- [ ] Set reminder to check position movement in 4–6 weeks