# Store Locator Content Pack

Use this pack to turn `/pages/store-location` into a crawlable stockist page instead of a map-only or embed-only page.

## Goal

Make the stockist page useful for:

- people searching `where to buy Golden`
- people searching `Golden stockists`
- city-based discovery like `Golden soda Auckland`
- Google understanding that Golden is carried by real retailers in real places

## What To Put In The Shopify Page Body

The page body should include:

1. A short paragraph explaining that stock can vary by store.
2. A plain HTML list of stockists grouped by region or city.
3. Real retailer names in text.
4. Suburb or city names in text.
5. Optional retailer links where they exist.
6. A `Last updated` date in text.

Do not rely on:

- an embed with no text around it
- only suburb pins on a map
- screenshots or images of store lists

## Required Fields Per Stockist

Each retailer entry should contain, where possible:

- retailer name
- suburb
- city
- street address
- stock note such as `core range`, `lemon + blackcurrant`, or `selected flavours`
- optional website link
- last verified month

## Recommended Region Order

Use the regions where Golden actually has coverage. If coverage is thin, start with only the cities that are real.

Suggested order:

1. Auckland
2. Waikato / Bay of Plenty
3. Wellington
4. Nelson / Tasman
5. Canterbury
6. Otago
7. Southland

## Publish Method

1. Paste the HTML from [store-locator-page-body.html](/Users/grom/morgpork/golden/.claude/worktrees/seo-phase1-dev/docs/store-locator-page-body.html) into the `Store Locator` page body in Shopify admin.
2. Replace every placeholder before publishing.
3. Keep the heading levels intact.
4. Update the `Last updated` line every time the list changes materially.
5. If you want the map widget to use the same data source, align the Google Sheet to [store-locator-sheet-template.csv](/Users/grom/morgpork/golden/.claude/worktrees/seo-phase1-dev/docs/store-locator-sheet-template.csv).
6. Follow [store-locator-widget-setup.md](/Users/grom/morgpork/golden/.claude/worktrees/seo-phase1-dev/docs/store-locator-widget-setup.md) to connect the sheet and Mapbox token in the theme editor.

## Editorial Rules

- Keep city headings in plain text: `Auckland`, `Wellington`, `Christchurch`.
- Use one line per retailer.
- If a stockist only carries a few flavours, say so.
- If availability changes often, say `call ahead for current flavour availability`.
- Link to retailer pages only if the URL is stable and public.
- If a city has no stockists yet, omit it. Do not publish empty headings.

## Minimum Viable Version

If you do not have the full national list ready yet, publish:

- Auckland
- Wellington
- Christchurch

That is still materially better than a generic page with no stockist text.
