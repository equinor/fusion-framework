__useFeature__

Custom hook for accessing and manipulating feature flags.

```ts
const Component = () => {
  const { feature, toggleFeature } = useFeature('my-feature');
  return (
    <>
      <p>My feature is { feature.enabled ? 'enabled': 'disabled' }</p>
      <button onClick={ () => toggleFeature() }>
        { feature.enabled ? 'disable' : 'enable' } my feature 
      </button>
    </>
  )
}
```

> [!NOTE]
> this hook can access parent feature if not found in application
