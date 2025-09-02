# Fusion React App

Package for developing applications that uses the `@equinor/fusion-framework`.

[API documentation](https://equinor.github.io/fusion-framework/modules/_equinor_fusion_framework_react_app.html)

__Dependencies__


[<img src="https://img.shields.io/github/package-json/v/equinor/fusion-framework?filename=packages%2Fframework%2Fpackage.json&label=framework&style=for-the-badge" />](https://github.com/equinor/fusion-framework/tree/main/packages/framework)

[<img src="https://img.shields.io/github/package-json/v/equinor/fusion-framework?filename=packages%2Fmodule%2Fpackage.json&label=module&style=for-the-badge" />](https://github.com/equinor/fusion-framework/tree/main/packages/module)

[<img src="https://img.shields.io/github/package-json/v/equinor/fusion-framework?filename=packages%2Fmodule-http%2Fpackage.json&label=module-http&style=for-the-badge" />](https://github.com/equinor/fusion-framework/tree/main/packages/module-http)

[<img src="https://img.shields.io/github/package-json/v/equinor/fusion-framework?filename=packages%2Fmodule-msal%2Fpackage.json&label=module-msal&style=for-the-badge" />](https://github.com/equinor/fusion-framework/tree/main/packages/module-msal)

[<img src="https://img.shields.io/github/package-json/v/equinor/fusion-framework?filename=packages%2Freact-module%2Fpackage.json&label=react-module&style=for-the-badge" />](https://github.com/equinor/fusion-framework/tree/main/packages/react-module)

[<img src="https://img.shields.io/github/package-json/v/equinor/fusion-framework?filename=packages%2Freact-module-app-config%2Fpackage.json&label=react-module-app-config&style=for-the-badge" />](https://github.com/equinor/fusion-framework/tree/main/packages/react-module-app-config)


## Configure
```tsx
// config.ts
import { AppConfigurator } from '@equinor/fusion-framework-react-app';
const configCallback: AppConfigurator = (configurator) => {
 configurator.http.configureClient(
    'bar', {
      baseUri: 'https://somewhere-test.com',
      defaultScopes: ['foo/.default']
    }
  );
};

// App.tsx
export const App = () => {
  const client = useHttpClient('bar');
  const [foo, setFoo] = useState('no value');
  const onClick = useCallback(() => {
    client.fetchAsync('api').then(x => x.json).then(setFoo);
  }, [client]);
  return <Button onClick={onClick}>{foo}</Button>
}

// index.ts
import { createApp } from '@equinor/fusion-framework-react-app';
export const render = createApp(App, configCallback);
export default render;
```

## Hooks

### useModule
```tsx
import { useModule } from '@equinor/fusion-framework-react-app';
const ShowToken = () => {
  const auth = useModule('auth');
  const [token, setToken] = useState<string>('');
  useEffect(() => {
    auth.acquireAccessToken().then(setToken);
  }, [auth]);
  return <span>{token ?? 'fetching token'}</span>
}
```

## Http

### useHttpClient

```tsx
import { useHttpClient } from '@equinor/fusion-framework-react-app/http';
const App = () => {
  const fooClient = useHttpClient('foo');
  
  // using as stream
  useEffect(() => {
    const sub = client.fetch('api/all').subscribe((x) => {
      setFoo(x.json());
    });
    return () => sub.unsubscribe();
  },[fooClient]);

  // using as promise
  const barClient =  useHttpClient('bar');
  useCallback(async() => {
    const res = await portalClient.fetchAsync('api/bar');
    console.log(res.json());
  },[barClient]);
  
}
```

## State Management

[<img src="https://img.shields.io/github/package-json/v/equinor/fusion-framework?filename=packages%2Fmodules%2Fstate%2Fpackage.json&label=@equinor/fusion-framework-module-state&style=for-the-badge" />](https://github.com/equinor/fusion-framework/tree/main/packages/modules/state)

The Fusion Framework provides a powerful state management solution that enables persistent, cross-component state sharing with automatic synchronization. Unlike traditional React state that's lost on page refresh, this state persists across app sessions and stays synchronized between different components in real-time.

**Key Benefits:**
- 🔄 **Persistent State**: Survives page refreshes and app restarts
- 🔗 **Cross-Component Sync**: Share state between any components instantly
- ⚡ **Optimistic Updates**: Responsive UI with automatic rollback on errors
- 🛡️ **Type Safe**: Full TypeScript support with type inference
- 🎯 **Simple API**: Works like `useState` but with persistence

**Use Cases:**
- User preferences and settings
- Form data that should persist
- UI state like filters, sorting, or view modes
- Data that needs to be shared across multiple components
- Cache management for expensive operations

### Installation

First, install the state module package:

```sh
pnpm install @equinor/fusion-framework-module-state
```

### Setup

Enable the state module in your app configuration. This initializes the persistent storage and makes `useAppState` available throughout your application:

```typescript
import { enableAppState } from '@equinor/fusion-framework-react-app/state';
export const configure: ModuleInitiator = (appConfigurator) => {
  enableAppState(appConfigurator);
};
```

> [!CAUTION]
> The state management module is a powerful tool, but it`s important to know the potential pitfalls and limitations when using it in your application. The state management is global and can lead to unexpected behavior if not used carefully.
>
> __example 1:__ If you have multiple components that rely on the same state, updating the state in one component can cause re-renders in all components that use that state, potentially leading to performance issues.
>
> __example 2:__ The user has open multiple tabs of the application, and each tab is modifying the same state. This can lead to unexpected behavior, as changes made in one tab will be reflected to all tabs. _(like storing user preferences for selected columns)_

### Basic Usage

Use `useAppState` just like React's `useState`, but with automatic persistence. The first parameter is a unique key, and the second is an options object with the default value:

```typescript
import { useAppState } from '@equinor/fusion-framework-react-app/state';

const Counter = () => {
  const [count, setCount] = useAppState('counter', { defaultValue: 0 });
  return (
    <div>
      <span>Count: {count}</span>
      <button onClick={() => setCount((prev) => (prev ?? 0) + 1)}>Increment</button>
    </div>
  );
};
```

### Cross-Component Synchronization

Multiple components can share the same state by using the same key. Changes in one component automatically update all others:

```typescript
import { useAppState } from '@equinor/fusion-framework-react-app/state';

const Incrementer = () => {
  const [count, setCount] = useAppState('counter', { defaultValue: 0 });
  return (
    <button onClick={() => setCount((prev) => (prev || 0) + 1)}>
      Increment
    </button>
  );
};

const Display = () => {
  const [count] = useAppState('counter', { defaultValue: 0 });
  return <span>Current count: {count}</span>;
};

// Usage in your app
const App = () => (
  <div>
    <Incrementer />
    <Display />
  </div>
);
```

### Advanced Usage

**Complex Objects with TypeScript:**
```typescript
interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  notifications: boolean;
}

const SettingsPanel = () => {
  const [settings, setSettings] = useAppState<UserPreferences>('user-settings', {
    defaultValue: { theme: 'light', language: 'en', notifications: true }
  });

  const toggleTheme = () => {
    setSettings(prev => ({
      ...prev!,
      theme: prev!.theme === 'light' ? 'dark' : 'light'
    }));
  };

  return <button onClick={toggleTheme}>Theme: {settings?.theme}</button>;
};
```

**Clearing State:**
```typescript
// Remove from storage completely
const clearSettings = () => setSettings(undefined);
```

### Best Practices

#### Avoid Stale Closures
> [!WARNING]
> When updating state based on the current value, always use the updater function to prevent stale closure issues in concurrent updates.
 
 ```typescript
 const [count, setCount] = useAppState('counter', { defaultValue: 0 });
 
 // ❌ Bad: Can use stale value in rapid updates
 const increment = () => setCount(count + 1);
 
 // ✅ Good: Always gets the latest value
 const increment = () => setCount(prev => (prev || 0) + 1);
 ```

#### State Key Organization

Use hierarchical naming for better organization:

```typescript
// ✅ Good - hierarchical, descriptive
'user.profile.personal'
'user.preferences.theme'
'app.settings.notifications'
'feature.dashboard.filters'

// ❌ Avoid - flat, unclear
'userdata'
'settings'
'stuff'
```

#### Use strong typing

```typescript
// ✅ Good - strong typing
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

const [user, setUser] = useAppState<UserProfile>('user.profile');

// ❌ Avoid - weak typing
const [user, setUser] = useAppState('user.profile');
```

> [!TIP] Validate Complex Schemas
> Use a library like `zod` or `yup` to validate complex state schemas before using them.
> ```typescript
> const userSchema = z.object({
>   id: z.string().uuid(),
>   name: z.string().min(2).max(100),
>   email: z.string().email(),
> });
>
> type UserProfile = z.infer<typeof userSchema>;
>
> // ✅ Good - strong typing with validation
> const useMyUser = () => {
>   const [value, setValue] = useAppState<UserProfile>('user.profile');
>   const setUser = useCallback((user: UserProfile) => {
>     if (userSchema.safeParse(user).success) {
>       setValue(user);
>       return true;
>     } else {
>       console.warn('Provided user is invalid');
>       return false;
>     }
>   }, [setValue]);
>   if(!userSchema.safeParse(value).success) {
>     console.warn('Current user state is invalid');
>     return null;
>   }
>   return value;
> };
> ```

## Feature Flag

> [!IMPORTANT]
> `@equinor/fusion-framework-module-feature-flag` must be installed to make this module available

### Simple
```ts
import { enableFeatureFlag } from '@equinor/fusion-framework-react-app/feature-flag'; 
export const configure: ModuleInitiator = (appConfigurator, args) => {
  /** provide a list of features that should be available in the application */
  enableFeatureFlag(appConfigurator, [
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