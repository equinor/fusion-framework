## Analytics

### useAnalytics

A hook to send analytic events.

```typescript
const { trackAnalytic } = useAnalytics();

trackAnalytic({
  name: 'foo',
  value: 'bar',
  attributes: {
    extra: 'data',
  }
});
```
