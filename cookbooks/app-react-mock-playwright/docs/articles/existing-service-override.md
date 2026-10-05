---
slug: existing-service-override
title: Existing service override
summary: Replace one response of a platform service without redefining its schema.
appKey: fusion-framework-cookbook-app-react-mock-playwright
sortOrder: 3
tags:
  - mock-server
  - people
---

## When to use it

Use `serviceDiscovery: 'merge'` when a **platform service already exists** (here `people`) and
you only need deterministic data for one operation.

## How the mock works

`mocks/people.mock.ts` inherits the bundled `people` schema from the `fusion` preset and replaces
only the `getPerson` response. Every other `people` operation keeps its generated response.

> Keep merge layers small. Only override what your test asserts on.
