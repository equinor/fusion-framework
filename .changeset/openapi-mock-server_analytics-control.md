---
"@equinor/fusion-openapi-mock-server": minor
---

Check recorded analytics from tests with `createMockAnalytics()`.

`createMockAnalytics(mockServerUrl)` from `@equinor/fusion-openapi-mock-server` reads the analytics a Fusion app sent to the mock Monitor service (`defineAnalyticsMock`):

- `list(request, filter?)` returns the received events, narrowed by `eventName`, `appKey`, or `feature`.
- `waitFor(request, { feature, match?, timeout? })` resolves with the first matching event. The framework sends analytics in batches, so tests should wait rather than read once. When nothing matches in time, the error lists what did arrive.
- `reset(request)` removes received events and keeps seeded history.

Pass Playwright's `context.request`. When the browser context has a mock-auth user, only that session's events are read and cleared, so parallel tests stay apart. Use `{ session: 'local-development' }` for a browser without a selected user.

```ts
const analytics = createMockAnalytics('http://localhost:4010');
test.beforeEach(({ context }) => analytics.reset(context.request));

test('tracks page views', async ({ context, page }) => {
  await page.goto('/apps/my-app/people');
  const event = await analytics.waitFor(context.request, { feature: 'page-viewed' });
  expect(JSON.parse(event.data_body_data ?? '{}')).toEqual({ route: '/people' });
});
```

The helper uses the new `GET` and `DELETE /@fusion-mock/analytics` control routes. Service definitions can add their own control routes at `/@fusion-mock/<name>` with `defineService({ control })`; they merge by name across `serviceDiscovery: 'merge'` layers, so a local merge layer keeps inherited routes such as `analytics`.

Refs: equinor/fusion-core-tasks#2181
