---
"@equinor/fusion-framework-cli": patch
---

Fix SemVer 2.0 compliance issue where build metadata was stripped from package versions.

- Disabled built-in normalization in `read-package-up` to preserve version build metadata
- Added manual package data normalization using `normalize-package-data` library
- Preserves original version with build metadata (e.g., `11.8.0+commit`) in app manifests
- Maintains backward compatibility with existing version formats
- Resolves issue where `+` build metadata was being stripped from versions in `app-manifest.json`

This fix enables proper SemVer 2.0 compliant versioning for applications built with the CLI.

Fixes https://github.com/equinor/fusion/issues/657

Thanks to [@v3gard](https://github.com/v3gard) for identifying and reporting this SemVer compliance issue.
