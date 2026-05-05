# Portal Cookbook

A minimal portal shell built with the Fusion Framework CLI. Demonstrates the simplest possible portal bootstrap — a standalone React render without framework module wiring.

## Purpose

This cookbook shows **how a portal entry point is structured** when using the Fusion CLI dev server. Unlike a Fusion *app* (which receives its framework context from a hosting portal), a portal *is* the host. It owns the root render and decides which modules, apps, and layout to provide.

## How It Differs from an App Cookbook

| Aspect           | App cookbook                          | Portal cookbook                        |
| ---------------- | ------------------------------------ | ------------------------------------- |
| Entry export     | `configure` + component              | `render(el)` — owns the DOM root      |
| Framework context| Provided by the portal host          | Created by the portal itself          |
| Module setup     | Receives pre-configured modules      | Configures and initializes modules    |
| Typical use      | Feature inside a portal              | The shell that hosts features         |

## Key Concept: The Render Contract

A portal exports a `render` function that the CLI dev server calls with a DOM element:

```ts
export const render = (el: HTMLElement) => {
  createRoot(el).render(createElement(Portal));
};
```

In production, this same contract is used by the static host to mount the portal.

## How to Run

```bash
pnpm install
pnpm dev
```

## What to Look At

| File            | What it demonstrates                          |
| --------------- | --------------------------------------------- |
| `src/index.tsx` | Portal render contract — `render(el)`         |
| `src/Portal.tsx`| Minimal portal shell component                |

## Next Steps

For a more complete portal example with framework modules, app loading, and HTTP configuration, see the [poc-portal cookbook](../poc-portal/README.md).