---
'@equinor/fusion-framework-module-app': minor
'@equinor/fusion-framework-react-app': minor
---

#### Changes:

1. **AppClient.ts**
   - Added `updateAppSettings` method to set app settings by appKey.
   - Initialized `#setSettings` query in the constructor.

2. **AppModuleProvider.ts**
   - Added `updateAppSettings` method to update app settings.

3. **App.ts**
   - Added `updateSettings` and `updateSettingsAsync` methods to set app settings.
   - Added effects to monitor and dispatch events for settings updates.

4. **actions.ts**
   - Added `updateSettings` async action for updating settings.

5. **create-reducer.ts**
   - Added reducer case for `updateSettings.success` to update state settings.

6. **create-state.ts**
   - Added `handleUpdateSettings` flow to handle updating settings.

7. **events.ts**
   - Added new events: `onAppSettingsUpdate`, `onAppSettingsUpdated`, and `onAppSettingsUpdateFailure`.

8. **flows.ts**
   - Added `handleUpdateSettings` flow to handle the set settings action.

9. **package.json**
   - Added `settings` entry to exports and types.

10. **index.ts**
    - Created new file to export `useAppSettings`.

11. **useAppSettings.ts**
    - Created new hook for handling app settings.

12. **app-proxy-plugin.ts**
    - Add conditional handler for persons/me/appKey/settings to prevent matching against appmanifest path
