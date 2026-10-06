---
"@equinor/fusion-openapi-mock-server": patch
---

Add the "Test analytics locally" guide (`docs/testing-analytics.md`). It covers how analytics flow from `useTrackFeature()` through the dev portal to `ffc mock-server` compared with production, recording and seeding options, checking tracked features in Playwright with `createMockAnalytics`, reading usage data through the app-feature events query, the event columns, differences from production, programmatic use, a route reference, and troubleshooting. The Playwright guide's route reference now lists `/@fusion-mock/analytics`.

Refs: https://github.com/equinor/fusion-core-tasks/issues/2184
