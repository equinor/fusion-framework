---
slug: getting-started
title: Getting started with mocked services
summary: How this cookbook serves APIs and help articles locally.
appKey: fusion-framework-cookbook-app-react-mock-playwright
sortOrder: 1
tags:
  - mock-server
  - playwright
---

# Mocked services

This article is served by `ffc mock-server` from `docs/articles/getting-started.md`. The dev
portal shows it when the app calls `useHelpCenter().openArticle('getting-started')`.

| Scenario | Service |
| --- | --- |
| Direct-only | `my-api` |
| Existing service override | `people` |
| Pre-production service | `aurora-api` |

Edit this file while the mock server runs, then open help again to see the change.
