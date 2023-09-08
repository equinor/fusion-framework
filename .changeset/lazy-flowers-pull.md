---
'@equinor/fusion-framework-module-http': minor
---

add method for executing blob requests

- added selector for extracting blob from response
- added function for fetching blob as stream or promise on the http client


```tsx
const data = await client.blob('/person/photo');
const url = URL.createObjectURL(blob);
return <img src={url} />
```