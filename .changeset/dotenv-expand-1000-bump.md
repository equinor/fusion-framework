---
"@equinor/fusion-load-env": patch
---

Internal: bump `dotenv-expand` from `^13.0.0` to `^1000.0.0`. Purely a version-number jump by the maintainer (see [changelog](https://github.com/dotenvx/dotenv-expand/blob/HEAD/CHANGELOG.md)) — adds command substitution and encrypted `.env` value support, requires Node.js >=16 (already satisfied by this repo's Node >=24 requirement). No API changes affecting this package's usage.
