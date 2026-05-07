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

### Typed bookmark payload (`src/types.ts`)

```ts
interface MyBookmark {
  page: string;   // which route was active
  title: string;  // user-facing label
  data: string;   // page-specific state
}
```

### Bookmark context provider (`src/Provider.tsx`)

A React context wraps the route tree and holds the current bookmark draft state. Components read and update this state via `useBookmarkContext()`. The actual bookmark creation (calling `createBookmark(state)`) happens in `src/Create.tsx`, which reads the current state from the provider.

### Route layout (`src/Routes.tsx`)

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

### Configuration (`src/config.ts`)

Enables navigation, context, and bookmark modules:

```ts
import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';

export const configure: AppModuleInitiator = (configurator, args) => {
  const { basename } = args.env;
  enableNavigation(configurator, basename);
  enableContext(configurator, async (builder) => {
    builder.setContextType(['projectMaster']);
  });
  enableBookmark(configurator);
};
```

## How to Run

```bash
pnpm install
pnpm dev
```

## File Guide

| File                          | Role                                           |
| ----------------------------- | ---------------------------------------------- |
| `src/config.ts`               | Module configuration (navigation, context, bookmark) |
| `src/types.ts`                | `MyBookmark` and `BookmarkState` type definitions |
| `src/Provider.tsx`            | React context for bookmark draft state         |
| `src/Router.tsx`              | Wraps routes with Fusion router                |
| `src/Routes.tsx`              | Route tree with provider + layout              |
| `src/Create.tsx`              | Form to create/update/delete bookmarks         |
| `src/Selected.tsx`            | Displays the currently selected bookmark       |
| `src/Page1.tsx` / `src/Page2.tsx` | Example pages that update bookmark payload     |