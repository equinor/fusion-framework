---
title: Module Services
category: Module
tag:
    - services
    - http
    - api
---

## Get bookmark

### Generate parameters

Method for generating endpoint and arguments.

```ts
import { generateParameters } from '@equinor/fusion-framework-module/service/bookmarks/get';

/** IHttpClient */
const response = client.fetch(...generateParameters('v1', { id: '123' }));
```

### Generate endpoint

Method for generating endpoint.

```ts
import { generateEndpoint } from '@equinor/fusion-framework-module/service/bookmarks/get';

const endpoint = generateEndpoint('v1', { id: '123' });
const response = await fetch(endpoint);
```
