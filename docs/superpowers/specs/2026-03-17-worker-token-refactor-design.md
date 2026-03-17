# Golden Horizon — Worker Token Refactor

**Approach:** C (Hybrid — Trim, Tokenise, Optimise)
**Branch:** dev
**Date:** 2026-03-17

## Context

The Golden Shopify theme (Horizon 3.0.1) carries ~70 unused files, three conflicting spacing scales, missing SEO schemas, and 44 globally-loaded JS files. This refactor standardises values using the Worker design token system, strips dead code, and fixes SEO gaps. The site must look identical after each phase.

## Phase 1: Strip

Delete unused theme components. Verify every page still works.

### Blocks to delete (32)

```
_announcement, _collection-image, _collection-info, _collection-link,
_content, _content-without-appearance, _divider, _featured-product,
_featured-product-gallery, _featured-product-price, _footer-social-icons,
_header-logo, _header-menu, _image, _inline-collection-title, _inline-text,
_marquee, _media, _media-without-appearance, _social-link, accordion_debug,
accordion_image, blog_card, collection-card, custom-liquid,
featured-collection, follow-on-shop, footer-copyright, footer-policy-list,
jumbo-text, menu, page, payment-icons, popup-link, product-custom-property,
product-inventory, social-links, vertical-text, video
```

### Snippets to delete (18)

```
background-video, dropdown-localization, filters-toggle, header-actions,
header-menu, list-filter, slideshow-arrow, slideshow-controls,
special-accordion-preset-editorial, special-accordion-preset-hero-bottom,
special-accordion-preset-icons-with-text,
special-accordion-preset-image-with-text, special-accordion-preset-marquee,
special-accordion-preset-pull-quote, special-accordion-preset-slideshow,
special-accordion-preset-split, special-accordion-preset-video,
split-showcase-carousel
```

### JS files to delete (20)

```
account-login-actions, cart-drawer, cart-icon, cart-note,
component-cart-items, copy-to-clipboard, drag-zoom-wrapper, email-signup,
facets, header-drawer, header-menu, jumbo-text, local-pickup,
predictive-search, product-custom-property, qr-code-generator,
qr-code-image, search-page-input, theme-editor, zoom-dialog
```

### CSS to evaluate

- `sections-optional.css` — check if it only styles deleted sections. If so, delete.

### Verification

After deletion, confirm these pages render correctly:
- Homepage (staygolden.co.nz)
- Collection page (/collections/all)
- A product page
- FAQ page (/pages/faq)
- Our Story (/pages/our-story)
- Store locator (/pages/store-locator)
- Cart (/cart)

Also grep for any `{% render %}` or `{% include %}` calls to deleted files. Fix any broken references before committing.

---

## Phase 2: Tokenise

### New files

**`assets/tokens-base.css`** — Worker shared base tokens (identical across all projects):
- Neutrals, semantic colours, surfaces
- `--space-1` through `--space-32` (4px to 128px scale)
- Type scale (`--text-hero` through `--text-micro`)
- Font families (overridden per project)
- Radius, shadows, motion, layout containers

**`assets/tokens-theme.css`** — Golden-specific overrides:
- `--color-accent`: Golden's pink (extract from settings_data.json scheme-3)
- `--font-display` / `--font-body`: "Gangster Grotesk" with fallbacks
- `--radius-*`: all 0 or near-0 (sharp aesthetic)
- Golden-specific tokens: product colours, side column widths, bee motif sizing

### Spacing collapse

Replace three families with one:

| Old | New | Value |
|-----|-----|-------|
| --margin-3xs / --padding-3xs / --gap-3xs | --space-05 | 0.125rem (2px) |
| --margin-2xs / --padding-2xs / --gap-2xs | --space-1 | 0.25rem (4px) |
| --margin-xs / --padding-xs / --gap-xs | --space-2 | 0.5rem (8px) |
| --margin-sm / --padding-sm / --gap-sm | --space-3 | 0.75rem (12px) |
| --margin-md / --padding-md / --gap-md | --space-4 | 1rem (16px) |
| --margin-lg / --padding-lg / --gap-lg | --space-4 | 1rem (16px) |
| --margin-xl / --padding-xl / --gap-xl | --space-6 | 1.5rem (24px) |
| --margin-2xl / --padding-2xl / --gap-2xl | --space-6 | 1.5rem (24px) |
| --margin-3xl / --padding-3xl | --space-8 | 2rem (32px) |
| --margin-4xl / --padding-4xl | --space-8 | 2rem (32px) |
| --margin-5xl / --padding-5xl | --space-12 | 3rem (48px) |
| --margin-6xl / --padding-6xl | --space-16 | 4rem (64px) |

Note: Some old values (sm=0.7rem, md=0.8rem) snap to the nearest Worker scale step. Visually test these.

### Colour replacement

Replace hardcoded hex values in CSS/Liquid with `var(--color-*)` tokens. Keep Shopify's colour scheme pipeline for section-level theming (it generates `--color-foreground`, `--color-background`, etc.) but map those to Worker token names where possible.

### Font replacement

Replace all `font-family` declarations with `var(--font-display)` or `var(--font-body)`.

### Liquid helper consolidation

Evaluate merging `spacing-style.liquid`, `gap-style.liquid`, `layout-panel-style.liquid` into fewer helpers that reference the `--space-*` scale.

### Verification

Visual diff: site looks identical. Check spacing, colours, fonts on all key pages.

---

## Phase 3: SEO + Performance

### Schema markup
- FAQPage schema on `/pages/faq`
- Organization schema in `layout/theme.liquid`
- LocalBusiness schema for store locator
- `<link rel="sitemap">` in meta-tags snippet
- Set `theme-color` meta to Golden's pink

### Heading hierarchy
- One `<h1>` per page type
- Homepage: "Golden" as h1
- Collection: collection title as h1
- Product: product title as h1
- Content pages: page title as h1

### Performance
- Audit 44 globally-loaded JS files — move per-page scripts out of scripts.liquid
- Split base.css into critical (above-fold) and deferred
- Defer non-critical CSS with print/onload pattern

### Verification
- Run Lighthouse on key pages
- Check Core Web Vitals
- Confirm no broken functionality

---

## Success criteria

1. Site looks identical after each phase
2. No broken pages or missing functionality
3. Spacing controlled by one `--space-*` scale
4. All brand values in `tokens-theme.css` (one file to change accent, fonts, radius)
5. Lighthouse performance score improves (Phase 3)
6. FAQPage, Organization, LocalBusiness schemas present (Phase 3)
