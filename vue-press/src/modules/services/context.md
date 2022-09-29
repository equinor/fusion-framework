---
title: Module Services
category: Module
tag:
  - services
  - http
  - api
---

## Get context

Get a context by id

## Query Context

Query the context service for context items

### Parameters

The __query__ parameter can be either a `string` or a `object`, which will decode to `OData` query string.

When providing a string, the string must be in a special `OData` format, use tools like [odata-query](https://www.npmjs.com/package/odata-query) to build the string

::: warning OData
not all functionalities are supported from the service, we advice to provide an object, which the framework generates the query string
:::

```ts
type QueryContextODataFilter = {
    type?: string[];
    externalId?: string;
};

type QueryContextODataParameters = {
    search?: string;
    filter?: {
      type?: string[];
      externalId?: string;
    }
};
``