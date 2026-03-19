STORE=morg-224.myshopify.com
THEME_ID=123456789
SHOPIFY_NODE_OPTIONS=--localstorage-file=$(HOME)/.shopify-localstorage

dev:
	NODE_OPTIONS='$(SHOPIFY_NODE_OPTIONS)' shopify theme serve --store $(STORE) --theme $(THEME_ID)

open:
	NODE_OPTIONS='$(SHOPIFY_NODE_OPTIONS)' shopify theme open --store $(STORE) --theme $(THEME_ID)

push:
	git add .
	git commit -m "Update theme"
	git push origin horizon/dev
