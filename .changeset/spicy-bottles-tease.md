---
'@equinor/fusion-framework-module-services': minor
---

Added person services

> __for internal usage only!__

- add function for fetching person details
- add function for querying persons
- add function for downloading person photo

```ts
const personApi = await modules.services.createPeopleClient();
personApi.query('v2', 'json$', {search: 'foo@bar.com'})
personApi.get('v4', 'json$', {azureId: '1234'})
personApi.photo('v2', 'blob$', {azureId: '123'})
``