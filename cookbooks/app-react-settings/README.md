# Settings Cookbook

This cookbook demonstrates how to create application settings that persist across sessions using the Fusion Framework settings module.

## What This Shows

This cookbook illustrates how to:
- Define type-safe settings with TypeScript
- Use the `useAppSetting` hook for individual settings
- Handle loading and updating states
- Display and modify settings with visual feedback

## Key Concepts

The settings system allows you to store user preferences and application state that persists between sessions. Each setting has:
- A unique key (name)
- A default value
- Type safety through TypeScript

## Code Example

### 1. Define Your Settings Type

First, define what settings your app will have:

```typescript
type MyAppSettings = {
  theme: 'none' | 'light' | 'dark';
  size: 'small' | 'medium' | 'large';
  fancy: boolean;
};
```

### 2. Extend the Module Interface

Make TypeScript aware of your settings:

```typescript
declare module '@equinor/fusion-framework-react-app/settings' {
  interface AppSettings extends MyAppSettings {}
}
```

### 3. Use Settings with State Management

```typescript
import { useCallback, useState } from 'react';
import { useAppSettings, useAppSetting } from '@equinor/fusion-framework-react-app/settings';

export const App = () => {
  // Manage loading states for settings
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Create hooks object once (memoized with useState initializer)
  const [settingsHooks] = useState(() => ({
    onLoading: setIsLoading,
    onUpdating: setIsUpdating,
  }));

  // Get individual settings with default values
  // The hook returns [value, setter] like useState
  const [theme, setTheme] = useAppSetting('theme', 'none', settingsHooks);
  const [size, setSize] = useAppSetting('size', 'medium', settingsHooks);
  const [fancy, setFancy] = useAppSetting('fancy', false);

  // Use callback for toggling boolean
  const onFancyChange = useCallback(() => setFancy((isFancy) => !isFancy), [setFancy]);

  // Get all settings at once
  const [settings] = useAppSettings();

  return (
    <div style={{ background: theme === 'dark' ? '#343434' : '#f0f0f0' }}>
      <h1>🚀 Hello Fusion Settings 🔧</h1>
      
      {/* Settings UI with loading states */}
      <select
        disabled={isLoading || isUpdating}
        value={theme}
        onChange={(e) => setTheme(e.currentTarget.value as MyAppSettings['theme'])}
      >
        <option value="none">None</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
      
      <input 
        type="checkbox" 
        checked={fancy} 
        onChange={onFancyChange} 
      />
      
      {/* Display all settings */}
      <pre>{JSON.stringify(settings, null, 2)}</pre>
    </div>
  );
};
```

## Understanding the Pattern

### Loading and Updating States

The `settingsHooks` object allows you to track when settings are being loaded from storage or saved to storage:

```typescript
const [settingsHooks] = useState(() => ({
  onLoading: setIsLoading,  // Called when loading settings from storage
  onUpdating: setIsUpdating, // Called when saving settings to storage
}));
```

### Disabling UI During Operations

Use these states to prevent user interactions while settings are loading or saving:

```typescript
<select disabled={isLoading || isUpdating} ... />
```

### Getting All Settings

You can access all settings at once with `useAppSettings()`:

```typescript
const [settings] = useAppSettings();
// settings = { theme: 'dark', size: 'medium', fancy: true }
```

## When to Use This

Use settings for:
- User preferences (theme, language, layout)
- Application configuration
- Remembering user choices
- Any data that should persist across sessions

The settings are automatically saved to browser storage and restored when the app loads again.