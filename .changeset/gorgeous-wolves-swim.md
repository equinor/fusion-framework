---
"@equinor/fusion-framework-app": minor
---

Added method to `AppConfigurator` to enabled `Feature Flag Module`

```ts
export const configure: ModuleInitiator = (appConfigurator, args) => {
  /** provide a list of features that should be available in the application */
  appConfigurator.useFeatureFlags([
    {
      key: MyFeatures.MyFlag,
      title: "this is a flag",
    },
    {
      key: MyFeatures.MyUrlFlag,
      title: "this feature can be toggled by ?my-url-flag=true",
      allowUrl: true,
    },
  ]);
};
```
