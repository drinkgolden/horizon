# Horizon — Golden Shopify Theme

Golden's Shopify storefront at staygolden.co.nz. A customised Horizon 3.0.1 theme for a New Zealand honey soda brand with three products (Manuka Lemon, Manuka Blackcurrant, Kanuka Kola). The site is as much a storytelling platform as a shop — 19 content pages about honey, ingredients, provenance, and the brand story, plus 3 product pages.

## Stack

- **Platform:** Shopify (Online Store 2.0, JSON templates)
- **Theme base:** Horizon 3.0.1 by Shopify
- **CSS:** Vanilla CSS with custom properties, no preprocessor
- **JS:** Web Components (custom elements), ES modules via importmap
- **Font:** Gangster Grotesk (self-hosted woff2 in assets/)
- **Templating:** Liquid
- **Social feed:** Cloudflare Worker in `apps/social-feed/`
- **Dev server:** `make dev` (Shopify CLI theme serve)
- **Deploy:** `make push` (pushes to Shopify)
- **Store:** morg-224.myshopify.com

## Branches

- `dev` — active development
- `staging` — pre-production testing
- `main` — production (what Shopify serves)

## File Structure

```
horizon/
├── assets/          — CSS (base.css, 5237 lines), JS (72 files), fonts, images
├── blocks/          — 105 draggable content blocks
├── config/          — settings_schema.json (theme settings), settings_data.json (saved values)
├── layout/          — theme.liquid (main layout), password.liquid
├── locales/         — en.default.json translations
├── sections/        — 36 section types (header, footer, product, hero, etc.)
├── snippets/        — 125 reusable Liquid partials
├── templates/       — JSON templates per page type (index, product.*, page.*, etc.)
├── apps/            — social-feed Cloudflare Worker
└── Makefile         — dev, open, push commands
```

## Design System (Current — Being Refactored)

### CSS Variable Pipeline
`settings_schema.json` → Shopify admin → `settings_data.json` → `snippets/theme-styles-variables.liquid` → CSS custom properties on `:root`

### Spacing (KNOWN MESS — refactor planned)
Three parallel scales that almost match but diverge:
- `--margin-*` (3xs through 6xl, 13 values)
- `--padding-*` (3xs through 6xl, 13 values)
- `--gap-*` (3xs through 3xl, 10 values)

Plus three Liquid render helpers: `spacing-style.liquid`, `gap-style.liquid`, `layout-panel-style.liquid`

**Refactor target:** Collapse all into one `--space-*` scale via Worker design tokens.

### Colour Schemes
8 schemes defined in settings_schema.json. Key ones:
- scheme-1: White bg / dark text (default)
- scheme-2: Dark bg / light text
- scheme-3: Pink bg (footer, announcement bar)
- scheme-4+: Product-specific colours

### Typography
All Gangster Grotesk. Four semantic families all point to the same font:
- `--font-body--family`
- `--font-heading--family`
- `--font-subheading--family`
- `--font-accent--family`

Fluid type scale generated via Liquid in theme-styles-variables.liquid.

### Z-Index Layers
```
--layer-section-background: -2
--layer-lowest: -1
--layer-base: 0
--layer-flat: 1
--layer-raised: 2
--layer-heightened: 4
--layer-sticky: 8
--layer-window-overlay: 10
--layer-header-menu: 12
--layer-overlay: 16
--layer-menu-drawer: 18
--layer-temporary: 20
```

## Key Files

| File | Purpose |
|------|---------|
| `layout/theme.liquid` | Main HTML shell, loads CSS/JS, defines header/main/footer structure |
| `snippets/theme-styles-variables.liquid` | All CSS custom properties (570 lines) |
| `snippets/scripts.liquid` | JS importmap, loads 44 files globally |
| `snippets/meta-tags.liquid` | SEO meta tags, Open Graph, structured data |
| `assets/base.css` | Primary stylesheet (5,237 lines) |
| `config/settings_schema.json` | Theme settings definitions |
| `config/settings_data.json` | Saved theme setting values |
| `templates/index.json` | Homepage template |
| `templates/product.lemon.json` | Lemon product page template |
| `sections/product-information.liquid` | Product page section |
| `sections/header.liquid` | Site header with nav |

## Active Refactor Plan

Three-phase hybrid refactor (Approach C):
1. **Phase 1 — Strip:** Delete ~70 unused files (32 blocks, 18 snippets, 20 JS)
2. **Phase 2 — Tokenise:** Worker design tokens (base.css + theme.css), collapse spacing scales
3. **Phase 3 — SEO + Performance:** Add schemas, fix h1s, split CSS, defer JS

## Design DNA — Do NOT Change These

- Gangster Grotesk font everywhere
- Pink announcement bar and footer (scheme-3)
- Side columns with gridline borders
- Floating bee motif button
- Minimal editorial layout
- Accordion-based content sections
- Split showcase (text + image) on homepage
- Large logo hero sections
- Rich text long-form story pages

## Voice and Tone

- Earnest, direct, confident
- Concise and uncomplicated, never boring
- UK English spelling
- No em dashes
- Do not sound like AI or generic brand strategy
- Do not use wellness or functional drink language
- Golden is about transparency, provenance, and flavour — not fixing your life

## Performance Budget

- LCP: < 2.5s (current: 4.1s — needs image optimisation)
- CLS: < 0.1 (current: 0 — passing)
- TBT: < 200ms (current: 90ms — passing)
- INP: < 200ms
- Lighthouse Performance: > 80 (current: 75 — close)
- CSS total: < 6,000 lines across all files
- JS files loaded per page: < 10

## Hard Rules

- Do NOT hardcode hex colours, font families, spacing values, or border-radius in CSS or Liquid — use tokens
- Do NOT add sections/blocks/snippets without checking if an existing one already does the job
- Do NOT modify `config/settings_data.json` directly — it's managed by Shopify admin
- Do NOT load JS globally unless it's needed on every page
- Do NOT use the Shopify editor — work from code via Git
- Always test on staygolden.co.nz after pushing changes
- Use lowercase kebab-case for all new file names
