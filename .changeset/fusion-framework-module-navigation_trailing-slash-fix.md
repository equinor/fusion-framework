---
"@equinor/fusion-framework-module-navigation": patch
---

Fix basename boundary matching and trailing-slash handling.

- `normalizePathname` no longer strips trailing slashes — only collapses consecutive slashes. Trailing slash is now preserved as part of the path identity.
- `_isWithinBasenameScope` uses a path-boundary check (`pathname === basename || pathname.startsWith(basename + '/')`) to prevent false positives from apps with overlapping name prefixes (e.g. `/apps/my-app` no longer matches `/apps/my-app-other/foo`).
- `_localizePath` falls back to `'/'` when the basename-stripped pathname is empty.
- Basename is normalized to never end with a trailing slash on construction.
