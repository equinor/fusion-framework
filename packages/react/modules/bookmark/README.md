# Fusion Framework React Bookmark Module

## Installation

```bash
pnpm add @equinor/fusion-framework-react-module-bookmark
```

## Hooks

### useBookmarkProvider

Hook for getting the bookmark provider instance.

> **Note:** This will use provided provider in the `ModuleContext`

```tsx
import { useBookmarkProvider } from '@equinor/fusion-framework-react-module-bookmark';
```

### useBookmark

```tsx
/** Example of using the useBookmark hook */
import { useBookmark } from '@equinor/fusion-framework-react-module-bookmark';
const { currentBookmark, setCurrentBookmark } = useBookmark();

return (
  <div>
    <button onClick={() => setCurrentBookmark('5e6c2b57-2b1b-44bf-a22f-6e083ac85220')}>
      Set bookmark by id
    </button>
    <button 
      onClick={() => setCurrentBookmark({ 
        id: '77febed1-f349-42e5-8006-3bfdc52fe79a', 
        name: 'My bookmark', 
        payload: { foo: 'bar' } 
      })}
    >
      Set bookmark by data
    </button>
    <button onClick={() => setCurrentBookmark(null)}>
      Clear current bookmark
    </button>
    <div>{currentBookmark?.name}</div>
    <div>{JSON.stringify(currentBookmark?.data)}</div>
  </div>
);
```

```ts
/** example of interacting with payload */
import { useBookmarkProvider, useBookmark } from '@equinor/fusion-framework-react-module-bookmark';


type PayloadData = {
  counter: number;
}

const bookmarkPayloadGenerator = (data) => {
  data.counter++;
};

const SomeComponent = () => {
  const bookmarkProvider = useBookmarkProvider();
  const { currentBookmark } = useBookmark<PayloadData>(bookmarkPayloadGenerator);

  useEffect(() => bookmarkProvider.on('bookmarkChange', ({ current, next }) => {
    console.log('Current bookmark payload', current.payload); 
    console.log('Bookmark updated payload', next.payload); 
  }), [bookmarkProvider]);

  const updateBookmark = useCallback(() => {
    bookmarkProvider.updateBookmark(currentBookmark.id);
  }, [currentBookmark.id]);

  return (
    <div>
      <button onClick={updateBookmark}>
        Update bookmark
      </button>
      <div>{currentBookmark.payload.counter}</div>
    </div>
  );
};
```
