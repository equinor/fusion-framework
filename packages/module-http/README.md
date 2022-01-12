## Api Client

### Configure
```tsx
const configure = (config) => {
  config.http.configureClient(
      'bar', 
      'https://somewhere-test.com'
    );
}
```