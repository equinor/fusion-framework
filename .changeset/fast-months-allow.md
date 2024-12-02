---
'@equinor/fusion-framework-module-app': minor
---

Added `updateSetting` and `updateSettingAsync` to the `App` class. This allows updating a setting in settings without the need to handle the settings object directly. This wil ensure that the settings are mutated correctly.

```ts
const app = new App();
// the app class will fetch the latest settings before updating the setting
app.updateSetting('property', 'value');
```

example of flux state of settings:

```ts
const app = new App();
const settings = app.getSettings();

setTimeout(() => {
    settings.foo = 'foo';
    app.updateSettingsAsync(settings);
}, 1000);

setTimeout(() => {
    settings.bar = 'bar';
    app.updateSettingsAsync(settings);
    // foo is now reset to its original value, which is not what we want
}, 2000);
```
