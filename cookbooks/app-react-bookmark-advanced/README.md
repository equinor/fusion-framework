# Advanced Bookmark Cookbook

Demonstrates **multi-page bookmark management** with routing, shared bookmark state via React context, and a per-page payload pattern. This is the "advanced" counterpart to the basic [`app-react-bookmark`](../app-react-bookmark/README.md) cookbook.

## Basic vs Advanced

| Aspect              | `app-react-bookmark`                     | `app-react-bookmark-advanced`                   |
| ------------------- | ---------------------------------------- | ----------------------------------------------- |
| Pages               | Single page                              | Multiple routed pages                           |
| Bookmark payload    | Simple value                             | Typed `{ page, title, data }` per route         |
| State management    | Hook only                                | React context provider wrapping all routes       |
| Navigation          | None                                     | `@equinor/fusion-framework-react-router`        |
| Restore on select   | Replace single view                      | Navigate to saved page + restore payload         |

The advanced pattern is useful when bookmarks need to capture *where* the user was (route) alongside *what* they were looking at (page-specific data).

## Key Concepts

### Typed bookmark payload (`types.ts`)

```ts
interface MyBookmark {
  page: string;   // which route was active
  title: string;  // user-facing label
  data: string;   // page-specific state
}
```

### Bookmark context provider (`Provider.tsx`)

A React context wraps the route tree and holds the current bookmark draft state. Components read and update this state via `useBookmarkContext()`. When the user creates a bookmark, the provider captures the current `{ page, title, data }` as the payload.

### Route layout (`Routes.tsx`)

Routes are wrapped in `<Provider>` so all pages share bookmark state:

```tsx
const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <Provider>
        <nav>…</nav>
        <Outlet />
        <Create />
      </Provider>
    ),
    children: [
      { index: true, element: <Selected /> },
      { path: 'page1/*', element: <Page1 /> },
      { path: 'page2/*', element: <Page2 /> },
    ],
  },
];
```

### Configuration (`config.ts`)

Enables navigation, context, and bookmark modules:

```ts
enableNavigation(configurator, basename);
enableContext(configurator, async (builder) => {
  builder.setContextType(['projectMaster']);
});
enableBookmark(configurator);
```

## How to Run

```bash
pnpm install
pnpm dev
```

## File Guide

| File                      | Role                                           |
| ------------------------- | ---------------------------------------------- |
| `config.ts`               | Module configuration (navigation, context, bookmark) |
| `types.ts`                | `MyBookmark` and `BookmarkState` type definitions |
| `Provider.tsx`            | React context for bookmark draft state         |
| `Router.tsx`              | Wraps routes with Fusion router                |
| `Routes.tsx`              | Route tree with provider + layout              |
| `Create.tsx`              | Form to create/update/delete bookmarks         |
| `Selected.tsx`            | Displays the currently selected bookmark       |
| `Page1.tsx` / `Page2.tsx` | Example pages that update bookmark payload     |