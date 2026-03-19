# Lighthouse Baseline — Before Hour Fork

Date: 2026-03-19
URL: https://morg-224.myshopify.com?preview_theme_id=146404016267
Device: Desktop (headless Chrome)

## Scores

| Category | Score |
|----------|-------|
| Performance | 42 |
| Accessibility | 88 |
| Best Practices | 57 |
| SEO | 100 |

## Core Web Vitals

| Metric | Value |
|--------|-------|
| LCP (Largest Contentful Paint) | 4.8s |
| CLS (Cumulative Layout Shift) | 0 |
| TBT (Total Blocking Time) | 2,660ms |
| FCP (First Contentful Paint) | 2.8s |
| Speed Index | 8.2s |
| Time to Interactive | 27.8s |

## Notes

- SEO is already at 100 (Phase 3 work paid off)
- CLS is 0 (no layout shift, good)
- Performance is poor (42) — mainly due to TBT (2.6s) and LCP (4.8s)
- TBT is high because 72 JS files are loaded, many unused
- LCP is high likely due to large CSS file (5,237 lines base.css)
- The Hour fork should improve Performance score significantly via smaller CSS and fewer JS files
