---
"@equinor/fusion-framework-cli": patch
---

Fix CLI commands outputting invalid JSON due to dotenv messages appearing in stdout. Commands like `ffc app manifest` now produce clean JSON output suitable for automated tooling and CI/CD pipelines.
