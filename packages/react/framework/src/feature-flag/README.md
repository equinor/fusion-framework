__useCurrentAppFeatures__

Custom hook for accessing all feature flags for an application

```tsx
const Component =  () => {
  const appFeatures = useCurrentAppFeatures();
  if( appFeatures.features === undefined ){
      return <p>The current app does not have features enabled</p>
  }
  return (
    <>
      { 
        appFeatures.features.map(feature => (
          <button
            key={feature.key}
            disabled={ appFeatures.readOnly }
            onClick={ () => appFeatures.toggle( feature.key ) }
          >
            { feature.enabled ? 'disable' : 'enable' } feature { feature.title }
          </button>
        )) 
      
      }
    </>
  )
}
```

__useFrameworkFeature__

Custom hook for using a framework feature

__useFrameworkFeatures__

Custom hook for using all framework features

__useFeature__

> internal hook for getting a feature from a feature flag module

__useFeatures__

> internal hook for getting features of a feature flag module
