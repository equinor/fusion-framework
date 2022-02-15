# Fusion React App

Package for developing applications that uses the `@equinor/fusion-framework`.

[API documentation](https://equinor.github.io/fusion-framework/modules/_equinor_fusion_framework_react_app.html)

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

### useHttpClient

```tsx
import {useHttpClient} from '@equinor/fusion-framework-react-app/hooks';
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