# Golden can mark component

Two implementation options are documented in this folder:

1. `GoldenCanMark.tsx` – a web React component with built-in accessibility.
2. `sections/golden-can-mark.liquid` – a Shopify Online Store 2.0 section with colour and text controls.

## Shopify section

Add the “Golden can mark” section in the theme editor to surface the editable block. The settings let you:

* pick background, label text, and vertical accent colours
* upload an optional SVG/PNG of the can illustration
* enter a vertical wordmark and up to seven lines of label copy
* provide a custom screen-reader description

## React reference

The React component mirrors the accessible design. Replace the placeholder SVG imports with paths to your own assets (or collapse the artwork into a single SVG component).

Both variants render a `<figure>` with an ARIA-labelled `<svg>` so screen readers announce the can mark once while ignoring purely decorative paths. Update colours through CSS custom properties (`--golden-can-text`, `--golden-can-caption`) or the Shopify section settings.
