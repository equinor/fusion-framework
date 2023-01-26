## Configure

Module for configuring and providing http clients

### Simple
```ts
const configure = (config) => {
  config.http.configureClient(
      'bar', 
      'https://somewhere-test.com'
    );
}
```

### Standard
```ts
const configure = (config) => {
  config.http.configureClient(
      'bar', 
      {
        baseUri: 'https://foo.bar',
        defaultScopes: ['foobar/.default']
      }
    );
}
```

### Callback
```ts
const configure = async(config) => {
  config.http.configureClient(
      'bar',
      (client): => {
        client.uri = 'https://foo.bar'
        client.defaultScopes: ['foobar/.default']
      }
    );
}
```

## Consumption
```ts
const client = modules.http.createClient('foo');
const selector = (response: Response): Promise<FooBar> => response.json(); 
// stream
client.fetch('/api/admin', {selector, scopes: ['foobar/.admin']}).subscribe(x => console.log(x));
// async
client.fetchAsync('/api', {selector}).then(console.log);
```

## Operators
```ts
const client = modules.http.createClient('foo');
const logger = console.debug;
client.requestHandler.add((x: Request) => logger(x));
client.responseHandler.add((x: Request) => logger(x));
```