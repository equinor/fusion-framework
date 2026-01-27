---
"@equinor/fusion-framework-cli": minor
---

Add support for artifact-based app validation in publish command.

The CLI publish command now supports validating applications using metadata extracted from bundle artifacts instead of requiring local package.json and manifest files. This enables publishing applications from any directory in CI/CD pipelines without maintaining the full project structure.

**New capabilities:**
- Extract app information from bundle's `metadata.json` and `app-manifest.json`  
- Validate app registration using artifact metadata when bundle path is provided
- Maintain backward compatibility with existing package.json-based validation

**Usage:**
```bash
# Traditional validation (unchanged)
fusion-cli app publish

# New artifact-based validation  
fusion-cli app publish ./my-app.zip
```

This resolves the limitation where applications could only be published from directories containing the source package.json, enabling more flexible CI/CD deployment scenarios.