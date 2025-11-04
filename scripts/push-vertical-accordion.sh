#!/usr/bin/env bash
set -euo pipefail

# Pushes the Vertical Accordion section to the Shopify dev environment using the Shopify CLI.
# Usage:
#   ./scripts/push-vertical-accordion.sh [--env dev]
#
# By default the script targets the "dev" environment configured in config/shopify.yml.
# Pass a different environment name via --env <name> if necessary.

ENVIRONMENT="dev"

if [[ ${1-} == "--env" ]]; then
  if [[ -z ${2-} ]]; then
    echo "Error: --env flag requires an argument" >&2
    exit 1
  fi
  ENVIRONMENT="$2"
fi

if ! command -v shopify >/dev/null 2>&1; then
  echo "Error: Shopify CLI is not installed or not in PATH" >&2
  exit 1
fi

set -x
shopify theme push sections/vertical-accordion.liquid --env="$ENVIRONMENT" --allow-live
