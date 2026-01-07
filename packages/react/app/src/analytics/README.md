## Analytics

The Fusion Framework Analytics Module provides an unified way to track analytics.

This is a hook to manually send features to track.

This hook can be used by app teams wanting to track a specific feature they use.

### useTrackFeature

A hook to send feature used.

```typescript
const trackFeature = useTrackFeature();

trackFeature('foo');
```

```typescript
const SomeComponent = () => {
  const trackFeature = useTrackFeature();

  // Tracks when button is clicked.
  const handleOnClick = useCallback(() => {
    trackFeature('button-clicked');
  }, [trackFeature]);

  // Triggers when the component is loaded.
  useEffect(() => {
    trackFeature('SomeComponent loaded');

    // Send additional data
    trackFeature('some feature happened', {
      extra: 'data',
      foo: 'bar',
    });
  }, [trackFeature]);

  return <button onClick={handleOnClick}>Click me</button>;
};
```
