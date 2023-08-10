---
title: Authentication
category: Guide
tag:
  - how to
  - basic
  - app
  - authentication
---

## Setup authentication

When configuring http client to an web API, the client needs to know which scope it will be using.
The request for an identification token is done to a single web app, but this app needs to have an API permission to that api, this is done by exposing the api to the portal app.

> Each portal will have it`s own 'portal' app for authentication, please contact the portal teams for GUID to the correct portal

::: danger
Normally there are at least 2 app services (test/prod), this is to prevent access between the environments.

__Your application should at least have the same!__
:::

[read about exposing an application](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-configure-app-expose-web-apis)


::: warning

Event tho the framework supports multiple levels of auth modules, we recommend sticking to what you get from the portal!

_one scenario would be accessing API from another tenant_

:::