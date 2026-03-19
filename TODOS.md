# TODOS

## P2: JS Consolidation
**What:** Consolidate ~15 remaining JS web component files into 5-8 logical modules.
**Why:** 15 individual files is more than needed. Grouping by function (cart.js, product.js, navigation.js, accordion.js, utilities.js) improves maintainability and reduces HTTP requests.
**Context:** Deferred during the Hour deep fork (2026-03-19). The fork focused on CSS rewrite and file deletion. JS files were cleaned (unused deleted) but not consolidated. Each JS file is a web component (custom element) — consolidation means grouping related components into shared files.
**Effort:** M (CC: ~30 min)
**Depends on:** Hour fork complete and stable.

## P3: LCP Optimisation
**What:** Reduce LCP from 4.1s to under 2.5s.
**Why:** Performance budget target. LCP is the main remaining bottleneck.
**Context:** After the Hour fork, Lighthouse Performance went from 42 to 75. TBT is now 90ms (excellent). LCP at 4.1s is the next target — likely needs image optimisation (responsive images, lazy loading, preload hints for hero image).
**Effort:** M (CC: ~30 min)
**Depends on:** Hour fork complete.

## P3: Best Practices Score
**What:** Investigate and improve Lighthouse Best Practices from 57.
**Why:** Low score, likely caused by Shopify platform issues (third-party scripts, cookie consent).
**Context:** May be largely out of our control if it's Shopify-injected scripts. Worth auditing to see what's fixable.
**Effort:** S (CC: ~15 min investigation)
**Depends on:** None.
