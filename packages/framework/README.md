# Fusion Framework
🚨 **WIP**🏗

This package is under construction and currently under alpha.

__Expect breaking changes untill stable release!__

## Provider / Portal
```ts
const initialize = async() => {

  window.Fusion = await createInstance((root) => {
    
    // configure auth client instance
    root.auth.client = createAuthClient(
      'my-tennant-id', 
      'my-client-id', 
      '/msal/auth'
    );

    // define simple client (will use login scope)
    root.http.configureClient('foo', 'https://my.services.com');

    // define a client with callback for init
    root.http.configureClient('bar', (client) => {
      
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
```ts
  // default
  window.Fusion.createClient('bar')
    .fetch('/api/apps')
    .subscribe(async(x) => console.log(await x.json()));

  // by promise
  window.Fusion.createClient('bar')
    .fetchAsync('/api/apps')
    .then(async(x) => console.log(await x.json()));
```

## HttpClient

### fetch

> The fetch method of the client return an __Observable__ reponse.
>
> Observables has the advantage of cancel when unsuscribed.
>
> Secondly we can compose the flow easily with operator functions

```ts
import { fromEvent, of } from 'rxjs';
import { 
  debounceTime, 
  map,
  switchMap, 
  takeUntil, 
  catchError 
} from 'rxjs/operators';

const client = window.Fusion.createClient('my-client');

const input = document.createElement('input');
const result = document.createElement('pre');

// Observe changes on input field
const input$ = fromEvent(input, 'input');

input$.pipe(

  // only call after no key input in .5s
  debounceTime(500),

  // extract value from event
  map(x => x.currentTarget.value),

  // only search when text longer than 2 characters
  filter(x => x.length >=3),

  // query api with input value
  switchMap(x => client.fetch(`api/foo?q=${x}`).pipe(
    
    // retry 2 times
    retry(2)

    // cancel request if new input
    takeUntil(input$)
  )),

  // extract data from response
  switchMap(x => x.json()),

  // process error
  catchError(x => of({error: e.message}))

// write result to pre element
).subscribe(json => result.innerText = JSON.stringify(json, null, 2));

```

#### React
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

### fetchAsync

Incase for some reason you don`t want to use __Observables__, the ```fetchAsync``` will return a promise

```ts
const client = window.Fusion.createClient('my-client');
const input = document.createElement('input');
const result = document.createElement('pre');

let controller: AbortController;

input.addEventlistner('input', (e) => {
  try{
    // if a controller is defined, request might be ongoing
    controller && controller.abort();

    // create a new abort controller
    controller = new AbortController();

    // query api with 
    const response = await client.fetch({
      path: `api/foo?q=${e.currentTarget.value}`,
      signal: controller.signal,
    });
    const json = await response.json();
    result.innerText = JSON.stringify(json, null, 2)
  } catch(err){
    resilt.innerText = 'an error accoured'
  } finally{
    delete controller;
  }
});
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