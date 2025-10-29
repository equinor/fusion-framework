# Fusion React App

Package for developing applications that uses the `@equinor/fusion-framework`.

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

## MSAL Authentication

> [!IMPORTANT]
> `@equinor/fusion-framework-module-msal` must be installed to make MSAL hooks available

> [!CAUTION]
> **Applications should NOT configure the MSAL module themselves.** The MSAL module must be configured by the host/portal application for proper module hoisting. Apps should only use the hooks to access the already-configured MSAL module.

This package includes React hooks for Microsoft authentication using MSAL v4.

```tsx
import { useCurrentAccount, useAccessToken, useToken } from '@equinor/fusion-framework-react-app/msal';

const scopes = ['User.Read', 'api.read'];

function MyComponent() {
  // Get current logged-in user
  const user = useCurrentAccount();
  
  // Get access token for API calls
  const { token: accessToken } = useAccessToken( { scopes } );
  
  // Get full token details
  const { token } = useToken( { scopes } );
  
  if (!user) return <div>Please log in</div>;
  return <div>Welcome, {user.name}!</div>;
}
```

📖 **[See MSAL Authentication Documentation](docs/msal.md) for complete API reference, examples, and migration guide.**

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

[see module](https://equinor.github.io/fusion-framework/modules/feature-flag/module.html) for more technical information;