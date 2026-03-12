# Google Merchant Center And Search Console Plan

Written on March 13, 2026.

This is the next search-operations layer after the theme work. It is the part that helps Google trust Golden's product data, understand coverage across product and content pages, and measure whether the non-branded work is actually landing.

## Official Sources

- Search Console setup: https://support.google.com/webmasters/answer/34592
- Search Console sitemaps: https://support.google.com/webmasters/answer/7451001
- Search Console URL Inspection: https://support.google.com/webmasters/answer/9012289
- Search Console Performance report: https://support.google.com/webmasters/answer/7576553
- AI features and website guidance: https://developers.google.com/search/docs/appearance/ai-features
- Merchant listing structured data: https://developers.google.com/search/docs/appearance/structured-data/merchant-listing
- Product snippets: https://developers.google.com/search/docs/appearance/structured-data/product-snippet
- Search Console shipping and returns settings: https://developers.google.com/search/blog/2025/10/shipping-returns-settings-in-search-console
- Merchant Center support for richer product pages: https://support.google.com/merchants/answer/14994083
- Local free listings availability: https://support.google.com/merchants/answer/14632409
- Manufacturer Center support: https://support.google.com/manufacturers/answer/6124116
- Search Console branded traffic filter and query groups: https://developers.google.com/search/blog/2025/10/easier-performance-analysis-search-console

## What Golden Needs First

1. One verified Search Console domain property for `staygolden.co.nz`.
2. One Merchant Center account using a single clean Shopify sync source.
3. Accurate shipping and returns information in Merchant Center or Search Console.
4. Product data that matches the landing pages exactly.
5. A measurement setup that separates branded, commercial, authority, and local-discovery queries.

## Search Console Setup

### 1. Verify The Domain Property

Set up a domain property for `staygolden.co.nz`, not just a URL-prefix property. This keeps the full site under one reporting surface, including protocol changes and locale paths.

### 2. Submit The Sitemap Index

Submit:

- `https://staygolden.co.nz/sitemap.xml`

Then monitor whether the key URLs become discovered and indexed:

- home page
- core collections
- core product pages
- ingredients page
- New Zealand honey page
- where our honey comes from
- how Golden is made
- store locator
- shipping
- returns
- wholesale
- contact
- ingredients blog index
- first 3 to 5 ingredient articles

### 3. Use URL Inspection On Priority URLs

When a page changes materially, inspect it and request indexing only for:

- pages whose titles, copy, or internal links materially changed
- new authority pages
- new articles

Do not mass-request every page every time.

### 4. Build The Reporting Views That Matter

Track these buckets separately:

- branded: `golden`, `stay golden`, `golden soda`
- commercial honey soda: `honey soda`, `manuka soda`, `honey soft drink`
- commercial low-cal: `low cal soda`, `low sugar soda nz`, `better for you soda`
- authority honey: `what is manuka honey`, `manuka vs kanuka`, `new zealand honey`
- local discovery: `where to buy golden`, `golden stockists`, city + brand queries

If the branded traffic filter and query groups are available on the property, use them. If they are not available yet, replicate the same buckets in your export workflow.

### 5. Watch The Right Search Console Reports

Highest priority:

- Performance
- Page indexing
- Merchant listings
- Product snippets
- Core Web Vitals

The AI features guidance from Google is clear on the important point: AI search traffic still rolls into the normal `Web` search type. Do not create a separate reporting system that assumes AI traffic lives somewhere else.

## Merchant Center Setup

### 1. Clean Up The Account Foundations

Confirm:

- business information is complete
- website is claimed and verified
- free listings are enabled
- shipping is accurate
- returns are accurate

As of October 21, 2025, Search Console shipping and returns settings can be used by identified online merchant sites, and Google notes those settings can take precedence over on-page structured data where applicable. That means the settings need to match the site and policy pages exactly.

### 2. Use One Source Of Truth For Product Data

Do not let feed data, structured data, and landing page copy drift apart.

For each SKU, keep these aligned:

- product title
- description
- price
- availability
- image
- brand
- GTIN or MPN
- shipping and returns

### 3. Tighten The Feed Attributes

For Golden, the feed titles should be explicit rather than poetic.

Recommended format:

- `Lemon Manuka Honey Soda - 250ml x 12 - Golden`
- `Blackcurrant Manuka Honey Soda - 250ml x 12 - Golden`
- `Kanuka Kola Honey Soda - 250ml x 12 - Golden`

Recommended feed details:

- submit GTIN if the product has a real barcode
- if there is no GTIN, submit `brand` plus a real manufacturer-assigned `mpn`
- do not invent GTINs
- use `item_group_id` only if there are real variant groups
- include rich product details such as sweetener, origin, fruit source, refined sugar, and drink type

### 4. Improve The Product Pages For Merchant Surfaces

Google's richer product page guidance points in the same direction as the SEO work already done:

- longer, more complete descriptions
- more product highlights
- more structured product details
- more images
- clear policies

For Golden, the missing pieces are mostly product operations rather than theme code:

- add final ingredient lists in text where needed
- add any nutrition specifics that should be visible in text
- make sure each product image set is complete
- keep shipping and returns consistent between Merchant Center and site policies

### 5. Do Not Force Local Free Listings Unless Golden Has Its Own Retail Locations

Local free listings are available in New Zealand, but they are meant for merchants with their own local inventory or pickup locations. Third-party stockists are not the same thing as Golden-owned retail locations. If Golden does not operate its own local retail inventory, skip local free listings and focus on:

- standard free listings
- accurate product pages
- the stockist page
- retailer citation pages

### 6. Consider Manufacturer Center

If Golden is acting as the brand owner and can supply authoritative product data, Manufacturer Center is worth evaluating. It can help Google understand brand-owned product facts more directly.

## The Weekly Operating Rhythm

Every week:

1. Check Search Console Performance for non-branded impressions and clicks.
2. Check Merchant listings and Product snippets for warnings.
3. Check whether the newest authority pages are indexed.
4. Review the stockist page for changes that require text updates.
5. Note any pages that are getting impressions but weak CTR.

Every month:

1. Refresh the top query buckets.
2. Re-check feed titles and descriptions.
3. Review shipping and returns settings against the live site.
4. Add new internal links from fresh articles into commercial pages.

## Golden-Specific Priority Order

1. Verify or clean up Search Console domain property.
2. Submit sitemap and inspect all new authority and trust pages.
3. Clean Merchant Center shipping and returns.
4. Check feed titles, GTIN or MPN, and product detail depth for the 3 core SKUs.
5. Monitor non-branded query movement before expanding the product set or writing more content.
