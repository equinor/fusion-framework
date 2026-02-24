---
"@equinor/fusion-framework-module-analytics": minor
---

Change the log processor from SimpleLogProcessor to BatchLogProcessor.

This will accumulate all events happening within 5 seconds and send them as a
batch. This will improve performance.
