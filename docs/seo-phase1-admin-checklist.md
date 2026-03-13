# SEO Phase 1 Admin Checklist

This theme work adds the template and schema changes for Phase 1. A few store-admin steps are still required before everything is live.

## 1. Create crawlable policy pages

Create these pages in Shopify Admin and assign the matching template:

- Title: `Shipping`
  Handle: `shipping`
  Theme template: `page.shipping`

- Title: `Returns`
  Handle: `returns`
  Theme template: `page.returns`

The FAQ now links to these pages instead of blocked `/policies/...` URLs.

## 2. Confirm page templates

Confirm these pages are using the intended templates:

- `Ingredients` -> `page.ingredients`
- `FAQ` -> `page.faq`

## 3. Update collection SEO fields

In Shopify Admin, fill in the SEO title and meta description fields for:

- `honey-soda`
- `low-cal-manuka-soda`
- `lemon`
- `blackcurrant`
- `kanuka-kola`

The theme now has fallback metadata, but native Shopify SEO fields should still be populated for the final copy.

## 4. Add or verify social profile links

In Theme Settings, fill in the brand social URLs you want exposed in Organization schema:

- Facebook
- Instagram
- YouTube
- TikTok
- Pinterest
- X / Twitter
- LinkedIn

## 5. Optional: enable noindex control

If you want page-level noindex control in admin, create a boolean metafield definition:

- Namespace and key: `custom.seo_noindex`
- Applies to: products, collections, pages, blogs, and articles

When set to `true`, the theme outputs `noindex,follow` for that resource.
