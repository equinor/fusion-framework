---
"@equinor/fusion-framework-dev-portal": minor
---

Add feature flag `fusionLogAnalytics` to dev-portal in CLI.

Add `ConsoleAnalyticsAdapter` Adapter to analytics module if the feature flag is
enabled.

By enabling this feature flag, analytics events will be logged out in the
console. This is useful when you want to test events created by app teams (e.g.
using `trackFeature` hook).
