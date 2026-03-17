# Worker Token Refactor — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Strip dead code, tokenise the Golden Horizon theme with Worker design tokens, and fix SEO gaps.

**Architecture:** Three-phase hybrid refactor on the dev branch. Each phase is independently testable — the site must look identical after Phase 1 and 2, with measurable SEO/performance improvements after Phase 3.

**Tech Stack:** Shopify Liquid, CSS custom properties, Web Components (ES modules)

---

## Chunk 1: Phase 1 — Strip Dead Code

### Task 1: Delete unused blocks

**Files to delete:**
- `blocks/_collection-image.liquid`
- `blocks/_collection-info.liquid`
- `blocks/_content.liquid`
- `blocks/_footer-social-icons.liquid`
- `blocks/_inline-text.liquid`
- `blocks/_media.liquid`
- `blocks/_social-link.liquid`
- `blocks/accordion_debug.liquid`
- `blocks/accordion_image.liquid`
- `blocks/blog_card.liquid`
- `blocks/custom-liquid.liquid`
- `blocks/featured-collection.liquid`
- `blocks/page.liquid`
- `blocks/popup-link.liquid`
- `blocks/product-custom-property.liquid`
- `blocks/product-inventory.liquid`
- `blocks/vertical-text.liquid`

- [ ] **Step 1: Delete the 17 unused block files**

```bash
cd /Users/grom/morgpork/golden/horizon
git rm blocks/_collection-image.liquid blocks/_collection-info.liquid blocks/_content.liquid blocks/_footer-social-icons.liquid blocks/_inline-text.liquid blocks/_media.liquid blocks/_social-link.liquid blocks/accordion_debug.liquid blocks/accordion_image.liquid blocks/blog_card.liquid blocks/custom-liquid.liquid blocks/featured-collection.liquid blocks/page.liquid blocks/popup-link.liquid blocks/product-custom-property.liquid blocks/product-inventory.liquid blocks/vertical-text.liquid
```

- [ ] **Step 2: Verify no broken references**

```bash
# Search for render/include calls to any deleted block
grep -rn "render '\(accordion_debug\|accordion_image\|blog_card\|custom-liquid\|featured-collection\|popup-link\|product-custom-property\|product-inventory\|vertical-text\)" sections/ snippets/ layout/ blocks/
# Should return nothing
```

- [ ] **Step 3: Commit**

```bash
git commit -m "Strip 17 unused block files"
```

---

### Task 2: Delete unused snippets

**Files to delete:**
- `snippets/filters-toggle.liquid`
- `snippets/special-accordion-preset-editorial.liquid`
- `snippets/special-accordion-preset-hero-bottom.liquid`
- `snippets/special-accordion-preset-icons-with-text.liquid`
- `snippets/special-accordion-preset-image-with-text.liquid`
- `snippets/special-accordion-preset-marquee.liquid`
- `snippets/special-accordion-preset-pull-quote.liquid`
- `snippets/special-accordion-preset-slideshow.liquid`
- `snippets/special-accordion-preset-split.liquid`
- `snippets/special-accordion-preset-video.liquid`
- `snippets/split-showcase-carousel.liquid`

- [ ] **Step 1: Delete the 11 unused snippet files**

```bash
git rm snippets/filters-toggle.liquid snippets/special-accordion-preset-editorial.liquid snippets/special-accordion-preset-hero-bottom.liquid snippets/special-accordion-preset-icons-with-text.liquid snippets/special-accordion-preset-image-with-text.liquid snippets/special-accordion-preset-marquee.liquid snippets/special-accordion-preset-pull-quote.liquid snippets/special-accordion-preset-slideshow.liquid snippets/special-accordion-preset-split.liquid snippets/special-accordion-preset-video.liquid snippets/split-showcase-carousel.liquid
```

- [ ] **Step 2: Verify no broken references**

```bash
grep -rn "render '\(filters-toggle\|special-accordion-preset\|split-showcase-carousel\)" sections/ snippets/ layout/ blocks/
# Should return nothing
```

- [ ] **Step 3: Commit**

```bash
git commit -m "Strip 11 unused snippet files"
```

---

### Task 3: Delete unused JS

**Files to delete:**
- `assets/account-login-actions.js`

Note: The original audit identified 20 unused JS files, but verification found that 19 of them ARE referenced by liquid files (cart-drawer, header-drawer, facets, etc.). Only `account-login-actions.js` is truly unreferenced.

- [ ] **Step 1: Verify account-login-actions.js has no references**

```bash
grep -rn "account-login-actions" sections/ snippets/ layout/ blocks/ templates/ assets/
# Should return nothing (or only the file itself)
```

- [ ] **Step 2: Delete**

```bash
git rm assets/account-login-actions.js
```

- [ ] **Step 3: Commit**

```bash
git commit -m "Strip unused account-login-actions.js"
```

---

### Task 4: Verify site integrity

- [ ] **Step 1: Push to dev and check pages**

```bash
make push
```

Check these URLs on the dev theme:
- Homepage
- /collections/all
- /pages/faq
- /pages/our-story
- /pages/store-locator
- /cart

- [ ] **Step 2: Commit any fixes if needed**

---

## Chunk 2: Phase 2 — Tokenise

### Task 5: Create Worker base tokens

**Files:**
- Create: `assets/tokens-base.css`

- [ ] **Step 1: Create tokens-base.css with the shared Worker foundation**

Create `assets/tokens-base.css` with the full Worker base token set:
- Neutrals: --color-black through --color-pure-white
- Semantic: --color-success, --color-warning, --color-error
- Surfaces: --color-bg-primary, --color-bg-secondary, --color-bg-dark, --color-text-primary, --color-text-secondary, --color-border, --color-border-strong
- Spacing: --space-1 (0.25rem) through --space-32 (8rem)
- Type scale: --text-hero through --text-micro (clamp values)
- Font families: --font-display, --font-body, --font-mono (system-ui defaults)
- Weights: --weight-regular through --weight-bold
- Radius: --radius-none through --radius-full
- Shadows: --shadow-sm through --shadow-none
- Motion: --ease-out, --duration-fast/normal/slow
- Layout: --container-default/narrow/wide, --container-padding

This file is identical to the base.css in Clearwater and House Party.

- [ ] **Step 2: Commit**

```bash
git add assets/tokens-base.css
git commit -m "Add Worker base tokens (shared across projects)"
```

---

### Task 6: Create Golden theme tokens

**Files:**
- Create: `assets/tokens-theme.css`
- Read: `config/settings_data.json` (to extract exact colour values)

- [ ] **Step 1: Extract Golden's brand values from settings_data.json**

Read `config/settings_data.json` to get exact hex values for:
- Scheme-3 background (the pink — accent colour)
- Scheme-1 colours (default white/dark)
- Scheme-2 colours (dark mode)
- Any other scheme colours in active use

- [ ] **Step 2: Create tokens-theme.css with Golden overrides**

```css
:root {
  /* Brand accent */
  --color-accent: /* pink from scheme-3 */;
  --color-accent-hover: /* slightly darker */;
  --color-accent-light: /* very pale pink */;

  /* Fonts */
  --font-display: "Gangster Grotesk", "Helvetica Neue", Arial, sans-serif;
  --font-body: "Gangster Grotesk", "Helvetica Neue", Arial, sans-serif;

  /* Radius — Golden uses sharp edges */
  --radius-sm: 0px;
  --radius-md: 0px;
  --radius-lg: 0px;

  /* Golden-specific tokens */
  --color-product-lemon: /* extract */;
  --color-product-blackcurrant: /* extract */;
  --color-product-kola: /* extract */;
}
```

- [ ] **Step 3: Commit**

```bash
git add assets/tokens-theme.css
git commit -m "Add Golden theme tokens (brand overrides)"
```

---

### Task 7: Load tokens in theme layout

**Files:**
- Modify: `snippets/theme-styles-variables.liquid`
- Modify: `layout/theme.liquid`

- [ ] **Step 1: Add token CSS imports to theme.liquid**

Add before the existing base.css link:
```liquid
{{ 'tokens-base.css' | asset_url | stylesheet_tag }}
{{ 'tokens-theme.css' | asset_url | stylesheet_tag }}
```

- [ ] **Step 2: Verify tokens load without breaking existing styles**

Existing variables (--margin-*, --padding-*, --gap-*) should still work because they're still defined. The new --space-* variables are additive.

- [ ] **Step 3: Commit**

```bash
git add layout/theme.liquid
git commit -m "Load Worker token CSS files in theme layout"
```

---

### Task 8: Replace spacing variables

**Files:**
- Modify: `snippets/theme-styles-variables.liquid`
- Modify: `assets/base.css`
- Modify: All liquid files referencing old spacing variables

- [ ] **Step 1: Add --space-* aliases in theme-styles-variables.liquid**

In the `:root` block, add backward-compatible aliases so old and new names both work:
```css
/* Spacing — Worker token scale */
--space-05: 0.125rem;  /* 2px */
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
--space-20: 5rem;      /* 80px */
--space-24: 6rem;      /* 96px */
--space-32: 8rem;      /* 128px */

/* Backward compat — old names point to new scale */
--margin-3xs: var(--space-05);
--margin-2xs: var(--space-1);
--margin-xs: var(--space-2);
--margin-sm: var(--space-3);
--margin-md: var(--space-4);
--margin-lg: var(--space-4);
--margin-xl: var(--space-6);
--margin-2xl: var(--space-6);
--margin-3xl: var(--space-8);
--margin-4xl: var(--space-8);
--margin-5xl: var(--space-12);
--margin-6xl: var(--space-16);

--padding-3xs: var(--space-05);
--padding-2xs: var(--space-1);
--padding-xs: var(--space-2);
--padding-sm: var(--space-3);
--padding-md: var(--space-4);
--padding-lg: var(--space-4);
--padding-xl: var(--space-6);
--padding-2xl: var(--space-6);
--padding-3xl: var(--space-8);
--padding-4xl: var(--space-8);
--padding-5xl: var(--space-12);
--padding-6xl: var(--space-16);

--gap-3xs: var(--space-05);
--gap-2xs: var(--space-1);
--gap-xs: var(--space-2);
--gap-sm: var(--space-3);
--gap-md: var(--space-4);
--gap-lg: var(--space-4);
--gap-xl: var(--space-6);
--gap-2xl: var(--space-8);
--gap-3xl: var(--space-12);
```

- [ ] **Step 2: Visual test — site should look identical**

Some values snap slightly (e.g., old --margin-sm was 0.7rem, now 0.75rem; old --padding-md was 0.8rem, now 1rem). Check homepage and product page for spacing shifts.

- [ ] **Step 3: Commit**

```bash
git add snippets/theme-styles-variables.liquid
git commit -m "Add Worker --space-* scale with backward-compat aliases"
```

- [ ] **Step 4: Gradually replace old variable references in base.css**

Find-and-replace in `assets/base.css`:
- `var(--margin-xs)` → `var(--space-2)`
- `var(--padding-lg)` → `var(--space-4)`
- etc.

Do this incrementally, testing after each batch.

- [ ] **Step 5: Commit**

```bash
git add assets/base.css
git commit -m "Replace old spacing variables with --space-* tokens in base.css"
```

---

### Task 9: Replace hardcoded colours and fonts

**Files:**
- Modify: `assets/base.css`
- Modify: `snippets/theme-styles-variables.liquid`

- [ ] **Step 1: Audit hardcoded hex values in base.css**

```bash
grep -n '#[0-9a-fA-F]\{3,8\}' assets/base.css
```

- [ ] **Step 2: Replace with token references where applicable**

Map each hardcoded value to its Worker token. Only replace values that match a token — don't force mismatches.

- [ ] **Step 3: Audit hardcoded font-family in base.css**

```bash
grep -n 'font-family' assets/base.css
```

Replace with `var(--font-display)` or `var(--font-body)`.

- [ ] **Step 4: Commit**

```bash
git add assets/base.css snippets/theme-styles-variables.liquid
git commit -m "Replace hardcoded colours and fonts with Worker tokens"
```

---

### Task 10: Verify Phase 2

- [ ] **Step 1: Search for remaining hardcoded values**

```bash
# Remaining hex values
grep -c '#[0-9a-fA-F]\{3,8\}' assets/base.css
# Remaining hardcoded font-family
grep -c 'font-family:' assets/base.css
# Count of --space-* usage vs old names
grep -c 'var(--space-' assets/base.css
grep -c 'var(--margin-\|var(--padding-\|var(--gap-' assets/base.css
```

- [ ] **Step 2: Push and visual test**

```bash
make push
```

Check all key pages for spacing, colour, and font regressions.

- [ ] **Step 3: Commit any fixes**

---

## Chunk 3: Phase 3 — SEO + Performance

### Task 11: Add missing schema markup

**Files:**
- Create: `snippets/schema-organization.liquid`
- Create: `snippets/schema-faq.liquid`
- Modify: `layout/theme.liquid`
- Modify: `templates/page.faq.json` or `snippets/meta-tags.liquid`

- [ ] **Step 1: Create Organization schema snippet**

```liquid
<!-- snippets/schema-organization.liquid -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Golden",
  "url": "https://staygolden.co.nz",
  "logo": "{{ settings.logo | image_url: width: 600 }}",
  "sameAs": [
    "https://www.instagram.com/staygoldennz/",
    "https://www.tiktok.com/@staygoldennz",
    "https://www.linkedin.com/company/staygoldennz",
    "https://www.threads.net/@staygoldennz"
  ]
}
</script>
```

- [ ] **Step 2: Add Organization schema to theme.liquid**

Add `{% render 'schema-organization' %}` before `</head>`.

- [ ] **Step 3: Create FAQ schema snippet**

The FAQ schema should read the accordion content from the page and output structured data. This needs to be added to the FAQ page template.

- [ ] **Step 4: Commit**

```bash
git add snippets/schema-organization.liquid snippets/schema-faq.liquid layout/theme.liquid
git commit -m "Add Organization and FAQ structured data schemas"
```

---

### Task 12: Fix heading hierarchy

**Files:**
- Modify: Various section/snippet liquid files

- [ ] **Step 1: Audit current h1 usage**

```bash
grep -rn '<h1' sections/ snippets/ blocks/ layout/
```

- [ ] **Step 2: Ensure one h1 per page type**

- Homepage: the large "Golden" logo text should be the h1
- Collection: collection title
- Product: product title
- Content pages: page title
- Fix any pages with zero or multiple h1 tags

- [ ] **Step 3: Commit**

```bash
git commit -am "Fix heading hierarchy — one h1 per page"
```

---

### Task 13: Add sitemap and theme-color meta

**Files:**
- Modify: `snippets/meta-tags.liquid`

- [ ] **Step 1: Add sitemap link and theme-color**

In `snippets/meta-tags.liquid`, add:
```liquid
<link rel="sitemap" type="application/xml" href="/sitemap.xml">
<meta name="theme-color" content="{{ scheme-3 pink hex value }}">
```

- [ ] **Step 2: Commit**

```bash
git add snippets/meta-tags.liquid
git commit -m "Add sitemap link and theme-color meta tag"
```

---

### Task 14: Performance — defer non-critical JS

**Files:**
- Modify: `snippets/scripts.liquid`

- [ ] **Step 1: Audit which of the 44 globally-loaded JS files are needed on every page**

Categorise each script:
- **Always needed:** critical.js, events.js, utilities.js, section-hydration.js, view-transitions.js, scrolling.js, component.js
- **Only on product pages:** product-form.js, variant-picker.js, product-price.js, media-gallery.js, product-rotate.js
- **Only on cart:** cart-discount.js, gift-card-recipient-form.js
- **Only on specific sections:** social-feed.js, slideshow.js, floating-motif-button.js

- [ ] **Step 2: Move per-page scripts out of global importmap**

Move non-critical scripts to be loaded only by the sections/blocks that need them, using Shopify's `{% javascript %}` tag or conditional loading.

- [ ] **Step 3: Run Lighthouse before and after**

Document scores for comparison.

- [ ] **Step 4: Commit**

```bash
git add snippets/scripts.liquid
git commit -m "Defer non-critical JS — load per-section instead of globally"
```

---

### Task 15: Final verification

- [ ] **Step 1: Run Lighthouse on key pages**

- Homepage
- Product page
- FAQ page
- Collection page

Document Performance, Accessibility, Best Practices, SEO scores.

- [ ] **Step 2: Push to dev**

```bash
make push
```

- [ ] **Step 3: Visual check all pages**

- [ ] **Step 4: Final commit with any fixes**
