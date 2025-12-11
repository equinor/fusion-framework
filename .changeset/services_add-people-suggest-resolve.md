---
"@equinor/fusion-framework-module-services": minor
"@equinor/fusion-framework-react-components-people-provider": minor
---

Add `suggest` and `resolve` methods to People API client for improved people picker functionality.

The People service now supports:

- **suggest**: Autocomplete/typeahead for people picker with optional system account filtering
- **resolve**: Batch resolution of person identifiers to full person objects

```typescript
// Suggest people based on search query
const suggestions = await peopleClient.suggest('json$', {
  method: 'POST',
  body: JSON.stringify({
    queryString: 'john',
    types: ['Person', 'SystemAccount']
  })
});

// Resolve multiple person identifiers
const resolved = await peopleClient.resolve('json$', {
  method: 'POST',
  body: JSON.stringify({
    identifiers: ['user1@example.com', 'user2@example.com']
  })
});
```

The React people-resolver component has been updated to leverage these new endpoints with built-in query caching.
A cookbook example is also available demonstrating the integration using the new PeoplePicker and PeopleViewer components in the app-react-people cookbook.
