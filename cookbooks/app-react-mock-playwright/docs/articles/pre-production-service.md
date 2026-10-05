---
slug: pre-production-service
title: Pre-production service
summary: Develop against a service before it is registered in Fusion service discovery.
appKey: fusion-framework-cookbook-app-react-mock-playwright
sortOrder: 4
tags:
  - mock-server
  - service-discovery
---

## When to use it

Use `serviceDiscovery: 'new'` for a service that **does not exist in discovery yet**, like the
fictional `aurora-api`.

## How the mock works

1. `mocks/aurora-api.mock.ts` adds `aurora-api` with its own OpenAPI schema.
2. The app registers it with `configurator.useFrameworkServiceClient('aurora-api')`.
3. When the service is registered for real, `'new'` reports a key collision, a reminder to
   remove the local definition.
