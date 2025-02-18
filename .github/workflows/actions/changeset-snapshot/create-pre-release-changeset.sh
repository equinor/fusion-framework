#!/bin/bash

set -e

OUTPUT_FILE=".changeset/pre-release-$1.md"
PACKAGES=$(pnpm list --recursive --depth=-1 --json | jq -r '.[] | select(.private != true) | .name')

if [ -z "$PACKAGES" ]; then
  echo "No public packages found."
  exit 1
fi

{
  echo "---"
  for PACKAGE in $PACKAGES; do
    echo "'${PACKAGE}': patch"
  done
  echo "---"
  echo ""
  echo "pre-release changeset for tag __$1__, all public packages are patched"
} > $OUTPUT_FILE

cat $OUTPUT_FILE