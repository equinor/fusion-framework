---
slug: usage-analytics
title: Usage analytics
summary: How this cookbook tracks app features and reads them back from the mock server.
appKey: fusion-framework-cookbook-app-react-mock-playwright
sortOrder: 5
tags:
  - analytics
  - mock-server
  - playwright
---

# Usage analytics

Every page tracks a `page-viewed` feature with `useTrackFeature()`, and the **Track demo
feature** button tracks `demo-feature-tracked` with how often it was clicked.

With `--mock`, the dev portal sends these events to the `monitor` service of `ffc mock-server`,
the same way the Fusion portal sends them in production. The mock server reads them like
Fusion's analytics pipeline does, records them to `.fusion-mock/analytics.jsonl`, and answers
the Apps service's app-feature events query with them. The list on this page uses that query,
so it shows your own events next to the history seeded from `mocks/analytics.seed.jsonl`.

| What you do | Where it shows up |
| --- | --- |
| Open a page | `page-viewed` with `{ "route": "/..." }` |
| Click **Track demo feature** | `demo-feature-tracked` with `{ "clicks": n }` |
| Check it in Playwright | `createMockAnalytics().waitFor(request, { feature })` |

Events are sent in batches about a second apart, so refresh the list after a moment.
