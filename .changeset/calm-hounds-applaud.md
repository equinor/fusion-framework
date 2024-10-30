---
'@equinor/fusion-framework-cli': patch
---

### Adds CHANGELOG.md to app zip package

- Removed individual file additions for package.json, LICENSE.md, and README.md.
- Added a loop to handle multiple files (package.json, LICENSE.md, README.md, CHANGELOG.md) in a more concise manner.
- Updated the spinner messages accordingly.
