## Portal Settings

> TBD

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
  const [ theme, setTheme ] = useAppSetting('theme', 'default');
  const [ mode, setMode ] = useAppSetting('mode', 'simple');

  // using the setter as a callback
  const toggleMode = useCallback(() => {
    setMode(mode => mode === 'simple' ? 'advanced' : 'simple')
  }, [setMode]);

  return (
    <MyThemeProvider theme={theme} onChange={setTheme}>
      <Button onClick={toggleMode}>Toggle mode</Button>
      {mode === 'simple' ? <SimpleView /> : <AdvancedView />}
    </MyThemeProvider>
  );
}
```

### Using all settings

> [!WARNING]
> **Using the `setSettings` must include all settings, not just the ones you want to change.**
> prefer using `setSettings` with a callback function.

> [!IMPORTANT]
> This is not recommended for large apps, as it will cause re-renders on every setting change.

```tsx
const MyApp = () => {
  const [ settings, setSettings ] = useAppSettings();

  const updateTheme = useCallback(
    (theme: AppSettings['theme']) => setSettings(settings => ({...settings, theme})),
    [updateSettings]
  );
      
  return (
    <MyThemeProvider theme={settings.theme} onChange={updateTheme}>
      {settings.mode === 'simple' ? <SimpleView /> : <AdvancedView />}
    </MyThemeProvider>
  );
}
```

### Using hook callbacks

The `useAppSettings` and `useAppSetting` hooks can take callbacks for loading, updating, updated and error handling.

> [!NOTE]
> These callbacks are optional and can be used to show loading spinners, error dialogs or other UI elements.
>
> We have chosen to use callbacks as parameters to the hooks, instead of returning them, to avoid unnecessary re-renders.

> [!NOTE]
> `onUpdating` and `onLoading` refers to the global state of the settings, not the individual settings. This means that if you have multiple settings that are being updated, the `onUpdating` and `onLoading` will be true until all settings are updated.
> 
> Good practice is to disable UI elements that can trigger settings updates when `onUpdating` or `onLoading` is true.


> [!IMPORTANT]
> Hooks must be memoized to avoid re-renders on every render. Provided callbacks are not internally memoized, to allow consumers to control implementation of these callbacks.

```tsx

// state and callback for loading settings
const [ loading, setLoading ] = useState(false);

// state and callback for updating settings
const [ updating, setUpdating ] = useState(false);

// state and callback for error handling
const [ error, setError ] = useState<Error | null>(null);

// callback for when settings are updated
const onUpdated = useCallback(() => {
  showSnackbar('Settings updated');
}, [showSnackbar]);

const [ settings, setSettings ] = useAppSettings(defaultSettings, {
  onLoading: setLoading,
  onUpdating: setUpdating,
  onError: setError,
});

const updateSettings = useCallback(() => {
  setSettings(/* new settings */);
}, [setSettings, onUpdated]);

return (
  <MyThemeProvider theme={settings.theme}>
    {loading && <Loading />}
    {updating && <Updating />}
    {error && <ErrorDialog error={error} />}
    <Button onClick={updateSettings} disabled={loading||updating}>
      Update settings
    </Button>
  </MyThemeProvider>
);
```
