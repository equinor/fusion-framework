# @equinor/fusion-framework-react-components-bookmark

Pre-built React UI components for bookmark management in Fusion applications. Provides a complete bookmark panel with filtering, grouping, create/edit/import modals, and clipboard sharing.

**Import:**

```ts
import { Bookmark, BookmarkProvider } from '@equinor/fusion-framework-react-components-bookmark';
```

## Components vs Hooks

| Need                                  | Package                                            |
| ------------------------------------- | -------------------------------------------------- |
| Ready-made bookmark UI panel          | `@equinor/fusion-framework-react-components-bookmark` (this package) |
| Bookmark hooks for custom UI          | `@equinor/fusion-framework-react-app/bookmark`     |
| Bookmark module configuration/types   | `@equinor/fusion-framework-module-bookmark`         |

Use this package when you want a drop-in bookmark sidebar. Use the hooks package when building a fully custom bookmark UI.

## Exports

| Export                       | Type      | Description                                             |
| ---------------------------- | --------- | ------------------------------------------------------- |
| `Bookmark`                   | Component | Full bookmark list with filtering, grouping, and actions |
| `BookmarkProvider`           | Component | Context provider with create/edit/import modals          |
| `useBookmarkComponentContext`| Hook      | Access the bookmark component context (provider, modals) |

## Usage

Wrap your bookmark area in `BookmarkProvider` and render the `Bookmark` list:

```tsx
import { Bookmark, BookmarkProvider } from '@equinor/fusion-framework-react-components-bookmark';

const BookmarkPanel = ({ provider, currentApp, currentUser }) => (
  <BookmarkProvider
    provider={provider}
    currentApp={currentApp}
    currentUser={currentUser}
  >
    <Bookmark />
  </BookmarkProvider>
);
```

### BookmarkProvider props

| Prop          | Type               | Description                        |
| ------------- | ------------------ | ---------------------------------- |
| `provider`    | `IBookmarkProvider`| Bookmark provider from the module  |
| `currentApp`  | `{ appKey, name }` | Current application identity       |
| `currentUser` | `{ id, name }`     | Current user identity              |

The provider manages modal state for creating, editing, and importing bookmarks. It also provides clipboard-based bookmark sharing via URL parameters.

## Built-in Features

- **Filtering** — text search across bookmark names
- **Grouping** — group bookmarks by app, creator, or other criteria
- **Create modal** — form for creating new bookmarks
- **Edit modal** — form for updating existing bookmarks
- **Import modal** — import bookmarks shared via URL
- **Clipboard sharing** — copy bookmark URL to clipboard

## Related

- [`@equinor/fusion-framework-module-bookmark`](../../../modules/bookmark/README.md) — the underlying bookmark module
- [`@equinor/fusion-framework-react-app/bookmark`](../../app/docs/bookmark.md) — bookmark hooks for custom UI
