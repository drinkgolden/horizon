# Lighthouse After — Hour Fork

Date: 2026-03-19
URL: https://morg-224.myshopify.com?preview_theme_id=146404016267
Device: Desktop (headless Chrome)

## Scores (Before → After)

| Category | Before | After | Delta |
|----------|--------|-------|-------|
| Performance | 42 | 75 | **+33** |
| Accessibility | 88 | 88 | 0 |
| Best Practices | 57 | 57 | 0 |
| SEO | 100 | 100 | 0 |

## Core Web Vitals (Before → After)

| Metric | Before | After | Delta |
|--------|--------|-------|-------|
| LCP | 4.8s | 4.1s | **-0.7s** |
| CLS | 0 | 0 | 0 |
| TBT | 2,660ms | 90ms | **-2,570ms** |
| FCP | 2.8s | 2.7s | -0.1s |
| Speed Index | 8.2s | 7.9s | -0.3s |

## What Caused the Improvement

- **TBT -2,570ms**: JS conditional loading per template (Phase 3 work) + deleted 5 unused JS files
- **LCP -0.7s**: Smaller CSS file (removed sections-optional.css), simplified Liquid rendering
- **Performance +33**: Primarily driven by TBT improvement

## Remaining Opportunities

- LCP still at 4.1s (target < 2.5s) — likely image optimisation needed
- Best Practices at 57 — investigate what Shopify platform adds
- JS consolidation (deferred) could further reduce parse time
