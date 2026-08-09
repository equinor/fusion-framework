# Tracking Events Manually

The provider exposes methods for ad-hoc event tracking outside of collectors:

```typescript
// Single event
provider.trackAnalytic({
  name: 'button-click',
  value: 'save',
  attributes: { section: 'toolbar' },
});

// Observable stream
const subscription = provider.trackAnalytic$(myEvent$);
// later: subscription.unsubscribe();
```
