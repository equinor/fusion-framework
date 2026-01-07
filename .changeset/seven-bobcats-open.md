---
"@equinor/fusion-framework-module-analytics": minor
"@equinor/fusion-framework-react-app": minor
---

`trackFeature` now has an extra optional argument for passing additional analytics
data.

Example
```typescript
const trackFeature = useTrackFeature();

// Without extra data
trackFeature('SomeComponent:loaded');

// Send additional data
trackFeature('some:feature:happened', {
  extra: 'data',
  foo: 'bar',
});
```
