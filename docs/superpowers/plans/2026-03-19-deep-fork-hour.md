# Deep Fork: Horizon → Hour — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gut Shopify's Horizon theme into a lean, Worker-token-native theme called "Hour" for Golden — same design, 60% less code, fully owned.

**Architecture:** Keep Shopify's platform integration (cart, checkout, payments, colour schemes). Rewrite all CSS from scratch using Worker tokens. Strip settings_schema.json to essentials. Delete all unused blocks/snippets/JS/sections. Rename repo.

**Tech Stack:** Shopify Liquid, CSS custom properties (Worker token system), vanilla JS web components, Shopify CLI

**Source of truth:** CEO plan at `~/.gstack/projects/drinkgolden-horizon/ceo-plans/2026-03-19-deep-fork-hour.md`

---

## File Structure

### Files to CREATE
- `assets/hour.css` — fresh-written CSS (~2,000 lines), replaces base.css

### Files to MODIFY
- `config/settings_schema.json` — strip to: theme_info, logo_and_favicon, colors, cart, pages
- `snippets/theme-styles-variables.liquid` — remove settings-dependent logic, hardcode Golden values
- `snippets/stylesheets.liquid` — reference hour.css instead of base.css
- `snippets/scripts.liquid` — remove imports for deleted JS files
- `CLAUDE.md` — update for Hour, add performance targets
- `Makefile` — update theme name references
- `.claude/launch.json` — update if needed

### Files to DELETE
- `assets/base.css` — replaced by hour.css
- `assets/sections-optional.css` — fold needed rules into hour.css
- ~23 unused blocks (see Task 2)
- ~13 unused JS files (see Task 2)
- ~10 unused sections (see Task 2)

### Files to KEEP (do not touch)
- `assets/tokens-base.css` — shared Worker foundation
- `assets/tokens-theme.css` — Golden brand overrides
- `layout/theme.liquid` — main layout shell
- `sections/header-group.json` — header config (Shopify-managed)
- `sections/footer-group.json` — footer config (Shopify-managed)
- `sections/header.liquid` — header section
- `sections/header-announcements.liquid` — announcement bar
- `sections/footer-utilities.liquid` — footer utilities
- `sections/section.liquid` — generic section (powers most of the site)
- `sections/product-information.liquid` — product pages
- `sections/main-page.liquid` — content pages
- All cart/checkout snippets
- `config/settings_data.json` — Shopify editor state (never manually edit)

---

## Chunk 1: Baseline and Cleanup

### Task 1: Lighthouse Baseline

**Files:**
- Create: `docs/superpowers/reports/2026-03-19-lighthouse-before.md`

- [ ] **Step 1: Run Lighthouse on current dev theme**

Run Lighthouse via Chrome DevTools or CLI against the dev theme URL.
Capture scores for: Performance, Accessibility, Best Practices, SEO.
Also capture: LCP, FID/INP, CLS values.

```bash
# If lighthouse CLI is available:
lighthouse https://morg-224.myshopify.com?preview_theme_id=146404016267 \
  --output=json --output-path=docs/superpowers/reports/lighthouse-before.json \
  --chrome-flags="--headless" 2>/dev/null || echo "Use browser DevTools instead"
```

- [ ] **Step 2: Document baseline scores**

Write a short report with the scores. This is our "before" snapshot.

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/reports/
git commit -m "Add Lighthouse baseline before Hour fork"
```

---

### Task 2: Delete Unused Files

**Files:**
- Delete: blocks, sections, JS listed below

**IMPORTANT:** Only delete files that are confirmed unused. The following lists have been verified — they have zero references in any Liquid file, template JSON, or layout file.

- [ ] **Step 1: Delete unused blocks**

These blocks are not referenced in any section or template:

```bash
cd /Users/grom/morgpork/golden/horizon
rm -f blocks/_collection-link.liquid
rm -f blocks/_content-without-appearance.liquid
rm -f blocks/_divider.liquid
rm -f blocks/_featured-product.liquid
rm -f blocks/_featured-product-gallery.liquid
rm -f blocks/_featured-product-price.liquid
rm -f blocks/_inline-collection-title.liquid
rm -f blocks/_marquee.liquid
rm -f blocks/_media-without-appearance.liquid
rm -f blocks/collection-card.liquid
rm -f blocks/follow-on-shop.liquid
rm -f blocks/jumbo-text.liquid
rm -f blocks/video.liquid
```

- [ ] **Step 2: Delete unused sections**

These sections are not referenced in any template JSON or layout:

```bash
rm -f sections/_blocks.liquid
rm -f sections/collection-links.liquid
rm -f sections/collection-list.liquid
rm -f sections/custom-liquid.liquid
rm -f sections/divider.liquid
rm -f sections/featured-blog-posts.liquid
rm -f sections/featured-product.liquid
rm -f sections/hero-splash.liquid
rm -f sections/marquee.liquid
rm -f sections/media-with-content.liquid
rm -f sections/slideshow.liquid
```

- [ ] **Step 3: Delete unused JS files**

These JS files are not imported in scripts.liquid or any Liquid file:

```bash
rm -f assets/account-login-actions.js
rm -f assets/jumbo-text.js
rm -f assets/product-custom-property.js
rm -f assets/qr-code-generator.js
rm -f assets/qr-code-image.js
```

- [ ] **Step 4: Verify site still works**

Push to Shopify dev theme and check homepage, product page, cart:

```bash
shopify theme push --theme 146404016267 --path . --allow-live
```

Then use preview tools to verify: homepage loads, product pages load, cart works.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Delete unused blocks, sections, and JS files"
```

---

### Task 3: Strip settings_schema.json

**Files:**
- Modify: `config/settings_schema.json`

- [ ] **Step 1: Read current settings_schema.json**

The file has 20 setting groups. Keep only these:
- `theme_info` — required by Shopify
- `t:names.logo_and_favicon` — logos and favicon
- `t:names.colors` — colour scheme definitions (8 schemes)
- `t:names.cart` — cart behaviour settings
- `Pages` — any page-specific settings

Remove these (editor-only, values now hardcoded in tokens):
- `t:names.typography` — fonts/sizes (hardcoded: Gangster Grotesk)
- `t:names.page_layout` — spacing/widths (hardcoded: Worker tokens)
- `Golden Grid` — grid settings (hardcoded: side columns in tokens)
- `t:names.animations` — animation settings (hardcoded in CSS)
- `t:names.badges` — badge styling (hardcoded in CSS)
- `t:names.buttons` — button styling (hardcoded in CSS)
- `t:names.drawers` — drawer styling (hardcoded in CSS)
- `t:names.icons` — icon styling (hardcoded in CSS)
- `t:names.input_fields` — input styling (hardcoded in CSS)
- `t:names.popovers_and_modals` — popup styling (hardcoded in CSS)
- `t:names.prices` — price display (hardcoded in CSS)
- `t:names.product_cards` — card styling (hardcoded in CSS)
- `t:names.search` — search styling (hardcoded in CSS)
- `t:names.swatches` — swatch styling (hardcoded in CSS)
- `t:names.variant_pickers` — variant picker styling (hardcoded in CSS)

- [ ] **Step 2: Edit settings_schema.json**

Read the file, identify the JSON array boundaries for each group to remove, and strip them. Keep the array structure valid.

- [ ] **Step 3: Verify theme still loads**

Push and check that the Shopify admin doesn't error and the dev theme still renders.

- [ ] **Step 4: Commit**

```bash
git add config/settings_schema.json
git commit -m "Strip settings_schema.json to essential settings only"
```

---

### Task 4: Simplify theme-styles-variables.liquid

**Files:**
- Modify: `snippets/theme-styles-variables.liquid`

- [ ] **Step 1: Read current file**

Currently 570 lines. Much of it is Liquid logic reading from `settings.*` to generate CSS variables for fonts, spacing, borders, buttons, etc. Since we stripped those settings in Task 3, this Liquid will error. Replace it.

- [ ] **Step 2: Rewrite theme-styles-variables.liquid**

The new version should ONLY contain:
1. The `@font-face` declaration for Gangster Grotesk (keep as-is)
2. Colour scheme RGB extraction (Shopify needs this for sections)
3. Logo height variables from settings
4. Any remaining settings that sections reference

Remove:
- All font size calculations (Liquid loop generating `--font-size--*`)
- All font preset generation (7 font presets with family/style/weight/case/line-height)
- All spacing variables (replaced by Worker `--space-*` tokens)
- All border variables that reference stripped settings
- All button/input/swatch/variant variables that reference stripped settings
- All icon/drawer/badge variables that reference stripped settings

The file should go from ~570 lines to ~100 lines.

- [ ] **Step 3: Verify**

Push and check that colour schemes still apply correctly to sections (backgrounds, text colours).

- [ ] **Step 4: Commit**

```bash
git add snippets/theme-styles-variables.liquid
git commit -m "Simplify theme-styles-variables.liquid — remove settings-dependent logic"
```

---

## Chunk 2: CSS Rewrite

### Task 5: Write hour.css from scratch

**Files:**
- Create: `assets/hour.css`
- Modify: `snippets/stylesheets.liquid` (reference hour.css instead of base.css)

This is the biggest task. Write a fresh CSS file that reproduces Golden's current visual design using Worker tokens natively.

- [ ] **Step 1: Audit what CSS Golden actually uses**

Before writing anything, identify the CSS categories the site needs by examining the rendered pages:

1. **Reset/base** — box-sizing, body, html, img defaults
2. **Layout** — side columns, gridlines, section structure, page width
3. **Typography** — headings, body text, prose measure, Butterick baseline
4. **Colour scheme** — Shopify scheme variable consumption
5. **Header** — sticky header, logo, nav, search, mobile drawer
6. **Footer** — footer layout, email signup, copyright
7. **Announcement bar** — marquee, styling
8. **Product** — product form, variant picker, price display, add to cart
9. **Cart** — cart drawer, cart items, totals, checkout button
10. **Accordion** — accordion component (used extensively)
11. **Content/RTE** — rich text rendering, editorial headers
12. **Cards** — product cards in collection/homepage
13. **Forms** — inputs, buttons, email signup
14. **Utilities** — visually-hidden, skip links, focus styles, animations
15. **Responsive** — mobile breakpoints

- [ ] **Step 2: Write hour.css — Reset and Base**

```css
/* hour.css — Golden's website styles
 * Built on Worker design tokens (tokens-base.css + tokens-theme.css)
 * Zero hardcoded values. Every visual property uses a token.
 */

* { box-sizing: border-box; }

:root {
  --image-placeholder-color: var(--color-product-honey);
}

body {
  color: var(--color-foreground);
  background: var(--color-background);
  display: flex;
  flex-direction: column;
  margin: 0;
  min-height: 100svh;
  font-family: var(--font-body);
  font-kerning: normal;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html, body { overflow-x: clip; }

@supports not (overflow: clip) {
  html, body { overflow-x: hidden; }
}

img:not([data-image-loaded]) {
  background-color: var(--image-placeholder-color);
}
img[data-image-loaded],
img.header-logo__image {
  background-color: transparent;
}
```

Continue writing each category from the audit. Reference the current rendered site via preview tools to ensure every visual element is covered. Use ONLY Worker tokens — no hardcoded hex, px spacing, font-family strings, or border-radius values.

- [ ] **Step 3: Write remaining sections**

Work through each category (layout, typography, colour scheme, header, footer, product, cart, accordion, content, cards, forms, utilities, responsive) one at a time. For each:
1. Inspect the rendered element on the dev theme
2. Write CSS using Worker tokens
3. Verify the element looks correct

Key rules:
- Colours: use `var(--color-*)` from tokens-theme.css or Shopify scheme vars
- Spacing: use `var(--space-*)` from tokens-base.css
- Typography: use `var(--font-*)`, `var(--text-*)`, `var(--leading-*)`, `var(--tracking-*)`
- Radius: use `var(--radius-*)` from tokens-theme.css (all 0px for Golden)
- Shadows: use `var(--shadow-*)` from tokens-base.css
- Motion: use `var(--ease-out)`, `var(--duration-*)` from tokens-base.css
- Z-index: keep the existing layer system (`--layer-*`)

- [ ] **Step 4: Update stylesheets.liquid**

Change the stylesheet reference from base.css to hour.css:

```liquid
{{ 'hour.css' | asset_url | stylesheet_tag }}
```

Remove the reference to sections-optional.css if its rules are folded into hour.css.

- [ ] **Step 5: Full visual verification**

Push to Shopify dev theme. Check every page type:
- Homepage: hero, split showcase, product cards, accordions, social feed, footer
- Product pages: all three (lemon, blackcurrant, kola)
- Collection page
- Content pages: Our Story, FAQ, Ingredients
- Cart drawer: add item, update, remove, checkout
- Mobile (375px): all of the above
- Side columns + gridlines
- Floating bee motif button
- Announcement bar

- [ ] **Step 6: Commit**

```bash
git add assets/hour.css snippets/stylesheets.liquid
git commit -m "Fresh-write hour.css — Worker-native CSS replacing base.css"
```

- [ ] **Step 7: Delete base.css and sections-optional.css**

Only after visual verification confirms hour.css is complete:

```bash
rm assets/base.css
rm assets/sections-optional.css
git add -A
git commit -m "Remove old Horizon CSS files (replaced by hour.css)"
```

---

## Chunk 3: Verification, Rename, and Docs

### Task 6: Lighthouse After + Performance Budget

**Files:**
- Create: `docs/superpowers/reports/2026-03-19-lighthouse-after.md`
- Modify: `CLAUDE.md` — add performance targets

- [ ] **Step 1: Run Lighthouse on forked theme**

```bash
lighthouse https://morg-224.myshopify.com?preview_theme_id=146404016267 \
  --output=json --output-path=docs/superpowers/reports/lighthouse-after.json \
  --chrome-flags="--headless" 2>/dev/null || echo "Use browser DevTools instead"
```

- [ ] **Step 2: Compare before/after**

Document the delta. Expected improvements:
- Performance: higher (smaller CSS, fewer files)
- LCP: faster (less CSS to parse)
- CLS: same or better

- [ ] **Step 3: Add performance targets to CLAUDE.md**

Add a "Performance Budget" section:
```markdown
## Performance Budget
- LCP: < 2.5s (target < 2.0s)
- CLS: < 0.1
- INP: < 200ms
- Lighthouse Performance: > 80 (target > 90)
- CSS total: < 3,000 lines
- JS files loaded per page: < 10
```

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/reports/ CLAUDE.md
git commit -m "Add Lighthouse before/after comparison and performance budget"
```

---

### Task 7: Rename Repo

**Files:**
- Modify: `CLAUDE.md`, `Makefile`, `.claude/launch.json`, memory files

- [ ] **Step 1: Rename on GitHub**

```bash
gh repo rename hour --repo drinkgolden/horizon --yes
```

- [ ] **Step 2: Update local git remote**

```bash
git remote set-url origin https://github.com/drinkgolden/hour.git
```

- [ ] **Step 3: Update CLAUDE.md header**

Change "Horizon — Golden Shopify Theme" to "Hour — Golden Shopify Theme" throughout.

- [ ] **Step 4: Update Makefile**

Update any references to "horizon" in branch names or comments.

- [ ] **Step 5: Verify remote works**

```bash
git push origin dev
```

- [ ] **Step 6: Commit any remaining reference updates**

```bash
git add -A
git commit -m "Rename repo from horizon to hour"
```

---

### Task 8: Write TODOS.md

**Files:**
- Create: `TODOS.md`

- [ ] **Step 1: Create TODOS.md with deferred work**

```markdown
# TODOS

## P2: JS Consolidation
**What:** Consolidate ~15 remaining JS web component files into 5-8 logical modules.
**Why:** 15 individual files is more than needed. Grouping by function (cart.js, product.js, navigation.js, accordion.js, utilities.js) improves maintainability.
**Context:** Deferred during the Hour deep fork (2026-03-19). The fork focused on CSS rewrite and file deletion. JS files were cleaned (unused deleted) but not consolidated. Each JS file is a web component (custom element) — consolidation means grouping related components into shared files.
**Effort:** M (CC: ~30 min)
**Depends on:** Hour fork complete and stable.
```

- [ ] **Step 2: Commit**

```bash
git add TODOS.md
git commit -m "Add TODOS.md with deferred JS consolidation task"
```

---

### Task 9: Final Push

- [ ] **Step 1: Push all changes to dev**

```bash
git push origin dev
```

- [ ] **Step 2: Push to Shopify dev theme**

```bash
shopify theme push --theme 146404016267 --path . --allow-live
```

- [ ] **Step 3: Final visual check**

Run through the test plan: homepage, products, collection, content pages, cart flow, mobile. Confirm everything matches the production site.
