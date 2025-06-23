---
"@equinor/fusion-framework-cli": patch
---

Update `.npmignore` and `package.json` to improve package publishing:

- Ensure `bin` directory is included in published files by updating `.npmignore` and adding it to the `files` array in `package.json`.
- Add `repository` field to `package.json` for better metadata.

These changes help ensure all necessary files are included in the published package and improve discoverability and metadata for consumers.
