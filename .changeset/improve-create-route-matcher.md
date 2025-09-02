---
"@equinor/fusion-framework-vite-plugin-api-service": minor
---

Improve `createRouteMatcher` to support multiple patterns and custom matcher functions. Adds better documentation and type safety for route matching.

>[!TIP] You can now pass an array of patterns to `createRouteMatcher`

```typescript
const matcher = createRouteMatcher<{ id: string }>({ 
  match: [
    '/user/:id', 
    '/profile/:id'
  ] 
});
matcher('/user/42', req); // { params: { id: '42' } }
matcher('/profile/99', req); // { params: { id: '99' } }
```
