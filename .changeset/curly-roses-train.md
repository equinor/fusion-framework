---
'@equinor/fusion-query': patch
---

Added try catch block to execution of query function, since the method might throw an exception before returning the observable.

```ts
const queryClient = new Query({
    client: {
        () => {
            throw new Error('this would terminate the process before');
            return new Observable((subscriber) => {
                throw new Error('this worked before');
            });
        },
    },
    key: (value) => value,

queryClient.query().subscribe({
    error: (error) => {
        // before changes this would not be called since stream would be terminated.
        console.log(error.message); // this would print 'this would terminate the process before'
    },
});
```
