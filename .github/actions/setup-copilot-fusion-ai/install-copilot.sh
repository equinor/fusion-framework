#!/usr/bin/env bash
set -euo pipefail

[[ "$COPILOT_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]
[[ "$COPILOT_SHA256" =~ ^[a-f0-9]{64}$ ]]
[[ "$(uname -m)" == x86_64 ]]

archive="$RUNNER_TEMP/copilot-${COPILOT_VERSION}.tar.gz"
curl --fail-with-body --location --silent --show-error \
  --output "$archive" \
  "https://github.com/github/copilot-cli/releases/download/v${COPILOT_VERSION}/copilot-linux-x64.tar.gz"
printf '%s  %s\n' "$COPILOT_SHA256" "$archive" | sha256sum --check
tar --extract --gzip --file "$archive" --directory "$RUNNER_TEMP"
rm "$archive"
echo "$RUNNER_TEMP" >> "$GITHUB_PATH"
