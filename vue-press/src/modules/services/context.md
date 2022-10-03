---
title: Module Services
category: Module
tag:
  - services
  - http
  - api
---

## Get context

```ts
import { generateEndpoint } from '@equinor/fusion-framework-module-services/get';
const url = generateEndpoint('v1', 'guid-of-an-project');
```

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
```

#### Example

::: code-tabs
@tab:active Basic

```ts
import { generateEndpoint } from '@equinor/fusion-framework-module-services/query';
const url = generateEndpoint('v1', {
  query: {
    search: 'johan',
    filter: {
      type: ['ProjectMaster'],
    }
  }
});
```

@tab OData
```ts
import { generateEndpoint } from '@equinor/fusion-framework-module-services/query';
import buildQuery from 'odata-query';

const query = buildQuery({
  search: 'johan',
  filter: {
      type: {
        in: ['ProjectMaster'],
      }
    }
});
const url = generateEndpoint('v1', query);
:::
