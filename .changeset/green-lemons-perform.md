---
"@equinor/fusion-imports": patch
---

Internal: Update esbuild dependency from 0.27.0 to 0.27.2

Includes bug fixes and enhancements:
- Fix bundler bug with `var` nested inside `if`
- Fix minifier bugs with edge cases
- Improved switch statement minification
- Auto-add `-webkit-mask` CSS prefix
- Support for `#/` import path specifiers
