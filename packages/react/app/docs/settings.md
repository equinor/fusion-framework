# Settings

Persist and read app-specific user settings using the Fusion settings service.

**Import:**

```ts
import { useAppSetting, useAppSettings } from '@equinor/fusion-framework-react-app/settings';
```

## Overview

App settings let users customise their experience (theme, layout, filters) with values persisted per-user by the Fusion platform. The `useAppSetting` hook manages a single setting, while `useAppSettings` provides access to all settings at once.

## Type Your Settings

Use module augmentation to get type-safe setting keys and values:

```ts
declare module '@equinor/fusion-framework-react-app/settings' {
  interface AppSettings {
    theme: 'default' | 'light' | 'dark';
    mode: 'simple' | 'advanced';
  }
}
```

## useAppSetting

Manages a single setting by key. Returns the current value and a setter function, similar to `useState`.

**Signature:**

```ts
function useAppSetting<TSettings, TProp extends keyof TSettings>(
  prop: TProp,
  defaultValue?: TSettings[TProp],
  hooks?: AppSettingsStatusHooks,
): [TSettings[TProp] | undefined, (update: TSettings[TProp] | ((current: TSettings[TProp]) => TSettings[TProp])) => void];
```

### Example

```tsx
import { useCallback } from 'react';
import { useAppSetting } from '@equinor/fusion-framework-react-app/settings';

const ThemeSwitcher = () => {
  const [theme, setTheme] = useAppSetting('theme', 'default');
  const [mode, setMode] = useAppSetting('mode', 'simple');

  const toggleMode = useCallback(() => {
    setMode((current) => (current === 'simple' ? 'advanced' : 'simple'));
  }, [setMode]);

  return (
    <div>
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value="default">Default</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
      <button onClick={toggleMode}>Toggle mode ({mode})</button>
    </div>
  );
};
```

## useAppSettings

Returns all settings as a single object with a bulk setter. Use `useAppSetting` for individual settings when possible — `useAppSettings` triggers a re-render on _any_ setting change.

**Signature:**

```ts
function useAppSettings<TSettings>(
  defaultValue?: TSettings,
  hooks?: AppSettingsStatusHooks,
): [TSettings | undefined, (update: TSettings | ((current: TSettings) => TSettings)) => void];
```

> [!WARNING]
> **`setSettings` must include all settings, not just the ones you want to change.** Use a callback to merge with the current state:
>
> ```ts
> setSettings((current) => ({ ...current, theme: 'dark' }));
> ```

### Example

```tsx
import { useCallback } from 'react';
import { useAppSettings } from '@equinor/fusion-framework-react-app/settings';

const SettingsPanel = () => {
  const [settings, setSettings] = useAppSettings();

  const updateTheme = useCallback(
    (theme: string) => setSettings((current) => ({ ...current, theme })),
    [setSettings],
  );

  return <ThemeSelector value={settings?.theme} onChange={updateTheme} />;
};
```

## Status Hooks

Both hooks accept optional status callbacks for loading, updating, and error states:

```tsx
const [loading, setLoading] = useState(false);
const [updating, setUpdating] = useState(false);
const [error, setError] = useState<Error | null>(null);

const [theme, setTheme] = useAppSetting('theme', 'default', {
  onLoading: setLoading,
  onUpdating: setUpdating,
  onError: setError,
  onUpdated: useCallback(() => console.log('Saved'), []),
});
```

> [!NOTE]
> `onUpdating` and `onLoading` reflect the _global_ settings state, not individual settings. Disable update buttons while either is `true`.

## Notes

- Settings are async — there is a loading phase when the component mounts and an updating phase when values are saved
- Status callbacks must be memoised; the hooks do not memoise them internally
- Settings are persisted per-user per-app by the Fusion platform
