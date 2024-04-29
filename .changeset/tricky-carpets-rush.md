---
"@equinor/fusion-query": patch
"@equinor/fusion-framework-cli": patch
---

Fixed issue with missing process env `FUSION_LOG_LEVEL`

- added default resolve value when generating base vite configuration
- moved default query log level resolve outside class

fixes: https://github.com/equinor/fusion/issues/343
