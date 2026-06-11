# Ecommerce SEO Playbook

## When to Use
Reference this file when the site is an ecommerce store (Shopify, WooCommerce, Magento, custom).
Use alongside technical-audit-template.md and keyword-research-framework.md.

---

## Ecommerce SEO Architecture Overview

```
Homepage
    ├── Category Pages (Pillar — highest SEO priority)
    │       ├── Subcategory Pages
    │       │       └── Product Pages (Leaf nodes)
    │       └── Filtered Views (canonical → category)
    ├── Blog / Content Hub (topical authority)
    └── Brand / Manufacturer Pages (optional — if search demand exists)
```

**Priority Order:** Category Pages > Product Pages > Blog > Brand Pages

---

## Section 1: Faceted Navigation & Crawl Budget

### The Core Problem
A category with 50 products + 5 filters (color, size, brand, price, material) can generate:
50 products × 5 filters × multiple values = thousands of URLs
Most have zero search demand. All waste crawl budget.

### Audit Steps
1. Crawl the site (Screaming Frog) — count total URLs with `?` parameters
2. GSC Coverage → check "Discovered - Not crawled" count
3. If "Discovered - Not crawled" is high → crawl budget problem

### Solution Framework

**Step 1: Classify each parameter type**
| Parameter | Example | Has Search Demand? | Action |
|-----------|---------|-------------------|--------|
| Color filter | `?color=red` | Sometimes (check volume) | Check → canonical or real page |
| Size filter | `?size=42` | Rarely | Canonical → category |
| Sort order | `?sort=price-asc` | Never | Noindex + robots disallow |
| Price range | `?min=100&max=500` | Rarely | Canonical → category |
| Brand filter | `?brand=nike` | Often YES | Create real `/brand/nike/` page |
| Search query | `?q=running+shoes` | Never | Noindex + disallow |

**Step 2: For filters with NO search demand**
```html
<!-- Add to <head> of filtered pages -->
<link rel="canonical" href="https://example.com/shoes/running/" />
```
Or block in robots.txt:
```
Disallow: /*?sort=
Disallow: /*?color=
```

**Step 3: For filters WITH search demand (e.g. brand, specific material)**
- Create a real landing page: `/shoes/nike/` instead of `/shoes/?brand=nike`
- Full SEO optimization: unique title, H1, description, content block
- These become proper subcategory pages

---

## Section 2: Category Page Optimization

Category pages = highest commercial intent pages = most important SEO pages on ecommerce sites.

### Category Page Template

**Title Tag:**
`[Category Name] — [Modifier] | [Brand]`
Examples:
- `Running Shoes for Men — Free Shipping | StoreName`
- `Organic Skincare — Natural Ingredients | StoreName`

**H1:** Category name (matches search intent — usually simple: "Men's Running Shoes")

**Content Block (Critical — often missing):**
- 100–300 words above OR below the product grid
- Covers: what this category is, buying guide hints, key features to look for
- Naturally includes primary + secondary keywords
- NOT keyword stuffed — written for users first

**Why content block matters:**
Google needs text to understand what the page is about.
A page with only product images and filters = thin content in Google's eyes.

### Category Page Checklist
- [ ] Unique title tag per category (not auto-generated template)
- [ ] H1 matches primary keyword with search demand
- [ ] Meta description compelling with CTA
- [ ] Content block present (100+ words, unique per category)
- [ ] Breadcrumb navigation present + BreadcrumbList schema
- [ ] Pagination handled correctly (self-canonical on pages 2+)
- [ ] Internal links to subcategories and top products
- [ ] No duplicate content between similar categories

### Category Keyword Research
For each category, target:
| Keyword Type | Example | Intent | Priority |
|-------------|---------|--------|----------|
| Main category | "running shoes" | Commercial | Pillar keyword |
| Category + qualifier | "best running shoes" | Commercial | High |
| Category + attribute | "lightweight running shoes" | Commercial | Subcategory |
| Category + use case | "running shoes for flat feet" | Commercial | Long-tail page |
| Category + brand intent | "Nike running shoes" | Navigational | Brand page |

---

## Section 3: Product Page Optimization

### Product Page Template

**Title Tag:** `[Product Name] — [Key Feature] | [Brand]`
Example: `Nike Air Zoom Pegasus 41 — Men's Running Shoe | StoreName`

**H1:** Product name (exact match to what customers search)

**Description Content:**
- Unique description (NOT the manufacturer's description — duplicate content)
- Cover: features, benefits, use cases, materials, sizing notes
- Answer common questions buyers have (reduces returns + helps SEO)

### Product Schema (Critical for Rich Results)
```json
{
  "@type": "Product",
  "name": "Product Name",
  "description": "...",
  "image": ["url1", "url2"],
  "brand": {"@type": "Brand", "name": "Nike"},
  "offers": {
    "@type": "Offer",
    "price": "99.99",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "url": "https://example.com/product/"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "reviewCount": "127"
  }
}
```

**Rich result benefits:** Price, availability, and star ratings appear in SERP → higher CTR.

### Product Page Checklist
- [ ] Unique product description (not manufacturer copy)
- [ ] Product schema with price, availability, and reviews
- [ ] Multiple product images with descriptive alt text
- [ ] Customer reviews visible on page (E-E-A-T + conversion)
- [ ] Breadcrumb present and matching schema
- [ ] Related products internal links
- [ ] Canonical set (especially important for products in multiple categories)
- [ ] URL structure: `/category/product-name/` (not `/product?id=12345`)

---

## Section 4: Out-of-Stock Page Handling

### Decision Framework

```
Is the product temporarily out of stock?
    ├── YES, coming back → Keep page live + update availability in schema
    │                     Add "notify me" email capture
    │                     Internal links still point to it
    └── NO, discontinued → Is there a replacement product?
            ├── YES → 301 redirect to replacement product
            └── NO → Is there a relevant category page?
                    ├── YES → 301 redirect to category
                    └── NO → Return 404 (if page has no backlinks)
                             OR soft 404 with "no longer available" message
```

### What NOT to Do
- ❌ Return 404 for a page with backlinks → you lose all link equity
- ❌ Keep showing "Add to Cart" when product is gone → terrible UX, potential legal issue
- ❌ Leave dozens of dead product pages with no redirect → crawl waste + poor UX

### Seasonal / Limited Products
- Keep URL live year-round (don't delete after season ends)
- Update content annually with new info
- Add "available [season] only" messaging when out of season
- Benefits: page accumulates authority year over year

---

## Section 5: Duplicate Content Issues

### Most Common Sources in Ecommerce

**1. Product Variants**
Problem: `/shoes/red/` and `/shoes/blue/` are nearly identical pages.
Fix options:
- If variants have their own search demand → keep as separate pages, differentiate content
- If no search demand → canonical all variants → main product page
- For color/size variants with no unique content: single page with variant selector (no separate URLs)

**2. Manufacturer/Supplier Descriptions**
Problem: Same product description on 100 sites.
Fix: Rewrite all product descriptions uniquely. Prioritize best-selling products first.

**3. Paginated Category Pages**
Problem: Page 1 and Page 2 of a category share title/meta.
Fix: Unique title for each: "Running Shoes | Page 2" or use descriptive page titles.

**4. Filtered URLs**
Problem: `/shoes/?color=red&size=42` has same content as `/shoes/`
Fix: Canonical all filtered URLs to the clean category URL.

**5. Tag / Label Pages (WordPress/WooCommerce)**
Problem: Auto-generated tag pages with 1–2 products each.
Fix: Noindex tags by default unless a tag has significant content and search demand.

### Duplicate Content Audit
In GSC → Coverage → "Duplicate, Google chose different canonical than user":
- This means you set a canonical but Google is ignoring it
- Usually means the canonical URL itself has an issue (redirect, noindex, different content)

---

## Section 6: Ecommerce Internal Linking Strategy

### Link Equity Flow
```
Homepage → Category Pages → Subcategory Pages → Product Pages
    ↑                                                    ↓
Blog Content ←←←←← Internal links from products ←←←←←←
```

### Internal Linking Rules for Ecommerce
- Homepage should link to top categories (not just navigation — editorial links in content)
- Category pages should link to top-selling products AND to blog content about that category
- Blog posts should link to relevant category and product pages (this converts readers to buyers)
- Product pages should link to: same category, related products, "frequently bought with"

### Breadcrumb Navigation
Every product and category page needs breadcrumbs:
`Home > Category > Subcategory > Product Name`
- Implement visually + add BreadcrumbList schema
- Helps with crawl efficiency + SERP display

---

## Section 7: Ecommerce-Specific Technical Checks

| Issue | Check | Priority |
|-------|-------|----------|
| Parameter URLs indexed | GSC → filter `?` in URLs | 🔴 |
| Product canonical in multiple categories | Check canonical tag on product pages | 🔴 |
| Thin category pages (no content block) | Crawl + check word count | 🔴 |
| Missing Product schema | Rich Results Test on product pages | 🔴 |
| Manufacturer descriptions (duplicate) | Copyscape or Siteliner | 🟡 |
| Out-of-stock 404s with backlinks | Ahrefs → broken backlinks | 🟡 |
| Pagination canonical errors | Screaming Frog → canonicals tab | 🟡 |
| Site search URLs indexed | GSC → filter `/search?q=` | 🔴 |
| Review content missing | Check product pages | 🟡 |
| Faceted navigation crawl waste | Log file analysis | 🟡 |

---

## Section 8: Platform-Specific Notes

### Shopify
- Default: `/collections/` for categories, `/products/` for products
- Known issue: duplicate `/products/` URLs appear under `/collections/product-handle/` — Shopify adds canonical automatically but verify it's working
- Pagination: Shopify uses `?page=X` — ensure no canonical from page 2 → page 1
- Apps: many SEO apps conflict — audit installed apps for duplicate canonical/meta tags

### WooCommerce (WordPress)
- Default: `/product-category/` and `/product/` 
- Tag pages: auto-generated, usually thin — noindex by default (Yoast/RankMath setting)
- Attribute pages (`/product-attribute/color/red/`): usually noindex unless they have demand
- Check for duplicate content between shop page and category pages

### Magento
- Most complex — faceted nav issues are severe by default
- Layered navigation generates massive URL variants — requires custom canonical implementation
- Check robots.txt for parameter blocking out of the box