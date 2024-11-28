## App Settings

App settings are a way to store and retrieve settings that are shared across the app. The settings are stored in the configured service of the app module.

```ts
declare module '@equinor/fusion-framework-react-app/settings' {
  interface AppSettings {
    theme: 'default' | 'light' | 'dark';
    mode: 'simple' | 'advanced';
  }
}
useAppSetting('theme', 'default');

// Explicit type the setting
useAppSetting<{notDefined: string}>('notDefined', 'not registered');
```

### Example

```tsx
const MyApp = () => {
  const { 
    setting: theme, 
    setSetting: setTheme 
  } = useAppSetting('theme', 'default');
  
  const { 
    setting: mode, 
    setSetting: setMode 
  } = useAppSetting('mode', 'simple');
  
  return (
    <MyThemeProvider theme={theme} onChange={setTheme}>
      {mode === 'simple' ? <SimpleView /> : <AdvancedView />}
    </MyThemeProvider>
  );
}
```

### Using all settings

> [!WARNING]
> **Using the `setSettings` must include all settings, not just the ones you want to change.**
 
> [!IMPORTANT]
> This is not recommended for large apps, as it will cause re-renders on every setting change.

```tsx
const MyApp = () => {
  const { settings, setSettings } = useAppSettings();
  
  const updateSettings = useCallback(
    (newSettings: Partial<AppSettings>) => {
      setSettings({ ...settings, ...newSettings })
    }, 
    [settings, setSettings]
  ); 

  const updateTheme = useCallback(
    (theme: AppSettings['theme']) => updateSettings({theme}),
    [updateSettings]
  );
      
  return (
    <MyThemeProvider theme={settings.theme} onChange={updateTheme}>
      {settings.mode === 'simple' ? <SimpleView /> : <AdvancedView />}
    </MyThemeProvider>
  );
}
```