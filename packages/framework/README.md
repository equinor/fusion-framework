# Fusion Framework
🚨 **WIP**🏗

This package is under construction and currently under alpha.

## Concept

### Services
Services are modules that the framework provides for the consumer.

When initializing the framework, the system creates a object with configurators.
The initiator configures services by adding callbacks for initalaztion of the service.
The system return providers for the configured services.

__Expect breaking changes untill stable release!__

## Provider / Portal
```ts
const initialize = async() => {

  window.Fusion = await createInstance((build) => {
    
    // configure auth client instance
    build.auth.client = createAuthClient(
      'my-tennant-id', 
      'my-client-id', 
      '/msal/auth'
    );

    // define simple client (will use login scope)
    build.http.configureClient('foo', 'https://my.services.com');

    // define a client with callback for init
    build.http.configureClient('bar', (client) => {
      
      // define base url for requests
      client.uri = 'https://my.other-services.com';

      // define default scope for auth request when using client instance
      client.defaultScope = ['https://somewhere.com/read'];

      // define a request proccessor - supports multiple
      client.requestHandler.add('custom-headers', (request) => {
          const headers = new Headers(request.headers);
          headers.append('x-app-version', 'v1.2.3');
          headers.append('x-app-env', 'alpha');
          return { ...request, headers };
      });
    });
  });
}
```

## Consumer / Application

### setup
```ts
export const setup = (fusion: Fusion, env: ApplicationManifest) => {
    const services = fusion.createServiceInstance((config) => {
        //@ts-ignore
        config.http.configureClient('app-client', env.endpoints.prod.myService);
        config.http.configureClient('data-proxy', 'https://somewhere-test.com');
        config.state.configureStore('my-store', (action$, state$, services) => {
            services.http.createClient('portal').fetch('sadasd')
        })
    });
    return (element: HTMLElement) =>  {
      const content = document.createElement('p');
      content.innerText = 'Hello Fusion';
      element.appendChild(content);
    }
};
```

## HttpClient
```ts
  // default
  services.createClient('bar')
    .fetch('/api/apps')
    .subscribe(async(x) => console.log(await x.json()));

  // by promise
  services.createClient('bar')
    .fetchAsync('/api/apps')
    .then(async(x) => console.log(await x.json()));
```

### fetch

The fetch method of the client return an __Observable__ reponse.
Observables has the advantage of cancel when unsuscribed.
Secondly we can compose the flow easily with operator functions

### React
TODO move to react lib
```tsx
import { useClient } from '@equinor/fusion-framework-react';
import { Subscription, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

const MyComponent = () => {
  const [query, setQuery] = useState('');
  const [value, setValue] = useState('');

  const client = useClient('my-client');
  const input$ = useMemo(() => new Subject(), []);

  // set next value for observe when input changes
  const onInput = useCallback((value: string) => {
    input$.next(value), [input$];
  });

  useEffect(() =>{
    const subscription = new Subscription();

    // set query state each time input change
    subscription.add(input$.subscribe(setQuery));

    // query api on change
    subscription.add(input$.pipe(
      switchMap(x => client.fetch(`api/foo?q=${x}`)),
      switchMap(x => x.json()),
    ).subscribe(setValue);

    // cancel subscriptions  on unmount
    return () => subscription.unsubscribe();
  }, []));
  return <>
    <input value={query} onInput={onInput} />
    <pre>{value}</pre>
  </>
};
```

### RequestHandler

Before a request is executed all registered request handlers are proccessed. The tail of a operator is chain to head of the next.

Handler must return same type as provided _```RequestInit```_ or _```void```_ and can be async.
```ts
type ProcessOperator<T, R = T> = (request: T) => 
  R | void | Promise<R | void>;
```

Handlers are keyed to allow override of existing by ```client.requestHandler.set```, using ```client.requestHandler.add``` will throw error if allready defined.

```ts
client.requestHandler.add('custom-headers', async(request) => {
  const values = await import('values.json');
  const headers = new Headers(request.headers);
  Object.keys(values).forEach(key => { 
    headers.append(`x-${key}`, values[key]);
  });
  return {...request, headers};
});
```