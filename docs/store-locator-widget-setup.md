# Store Locator Widget Setup

Use this after the `Store locator map` section is added to the `Store Locator` page template.

## What The Widget Needs

- a public Google Sheet or CSV URL
- latitude and longitude for every stockist row
- a Mapbox public access token if you want the interactive map

## Recommended Google Sheet Columns

Match the header row in [store-locator-sheet-template.csv](/Users/grom/morgpork/golden/.claude/worktrees/seo-phase1-dev/docs/store-locator-sheet-template.csv):

- `name`
- `address`
- `suburb`
- `city`
- `region`
- `postcode`
- `country`
- `latitude`
- `longitude`
- `website`
- `notes`
- `retailer_type`
- `featured`
- `sort`

## Google Sheet Setup

1. Put one stockist per row.
2. Make sure `latitude` and `longitude` are plain decimal values.
3. Share the sheet publicly or publish it as CSV.
4. Copy either:
   - the Google Sheet share URL, or
   - the direct CSV URL

The widget will convert a normal Google Sheets URL into a CSV export URL automatically.

## Theme Editor Setup

In the `Store Locator` page template section:

1. Paste the Google Sheet URL into `Google Sheet or CSV URL`.
2. Paste your Mapbox public token into `Mapbox access token`.
3. Keep `Enable Mapbox map` on if you want the map.
4. Leave the default map centre at New Zealand unless you want a different starting view.
5. Save and test the page on desktop and mobile.

## Data Notes

- `featured` accepts `true`, `yes`, or `1`
- `sort` is optional and controls manual ordering
- `retailer_type` can be values like `Cafe`, `Grocer`, `Bottle shop`, or `Stockist`
- `notes` is where you can say `core range`, `selected flavours`, or `call ahead for current availability`

## Failure States To Check

If the widget does not load:

- confirm the sheet is publicly accessible
- confirm every row has valid `latitude` and `longitude`
- confirm the Mapbox token is a public browser token
- confirm the page is using the `page.store-locator` template

If the map is blank but the list loads:

- the token is missing or invalid
- the token does not allow the styles or APIs being used

If nothing loads:

- check the browser console for blocked sheet requests
- test the CSV URL directly in a browser tab
