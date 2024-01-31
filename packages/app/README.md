# @equinor/fusion-framework-app

> support package for initializing application modules 

## 📚 read the [Doc](https://equinor.github.io/fusion-framework/)

## Feature Flag

> [!IMPORTANT]
> `@equinor/fusion-framework-module-feature-flag` must be installed to make this module available

### Simple
```ts
export const configure: ModuleInitiator = (appConfigurator, args) => {
  /** provide a list of features that should be available in the application */
  appConfigurator.useFeatureFlags([
    {
      key: MyFeatures.MyFlag,
      title: 'this is a flag',
    },
    {
      key: MyFeatures.MyUrlFlag,
      title: 'this feature can be toggled by ?my-url-flag=true',
      allowUrl: true,
    }
  ]);
}
```

### Custom
```ts
export const configure: ModuleInitiator = (appConfigurator, args) => {
  appConfigurator.useFeatureFlags(builder => /** see module for building custom config */);
}
```

[see module](../modules/feature-flag/README.md) for more technical information;

