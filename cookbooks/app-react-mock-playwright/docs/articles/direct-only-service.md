---
slug: direct-only-service
title: Direct-only app service
summary: An app-owned API that stays out of Fusion service discovery.
appKey: fusion-framework-cookbook-app-react-mock-playwright
sortOrder: 2
tags:
  - mock-server
  - service-discovery
---

## When to use it

Use a direct-only service when **your app owns the API URL**. The app reads the endpoint from
`app.config.local.ts`, so the service must not appear in service discovery.

## How the mock works

`mocks/my-api.mock.ts` uses `serviceDiscovery: false`:

- the mock server still answers `http://my-api.localhost:4010`
- `/@fusion-mock/discovery` does not list `my-api`
- `/identity` echoes the mock user's `oid`, which proves the bearer token reached the API
