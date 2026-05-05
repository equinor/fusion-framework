# POC Portal Cookbook

> [!WARNING]
> This is a **proof of concept** — not a production-ready application. Use it to learn portal initialization patterns, not as a template.

## Purpose

This cookbook demonstrates how to **bootstrap a Fusion portal from a statically hosted site**. It validates that a portal can:

1. Receive framework modules from the host environment
2. Create a `FrameworkProvider` and configure portal-level modules (app, HTTP)
3. Load and render child applications inside the portal shell

Study this cookbook to understand the portal bootstrapping lifecycle before building a real portal host.

## Key Concepts

### Portal entry point (`src/index.tsx`)

The portal exports a `render(el, modules)` function that receives an HTML element and the host's pre-initialized modules. This is the contract between the static host and the portal shell.

### Framework provider (`src/Framework.tsx`)

`createFrameworkProvider` wraps the portal in a Fusion framework context. Inside, the configurator:

- Enables the **app module** (`enableAppModule`) so the portal can discover and load child apps
- Configures an HTTP client for the app proxy endpoint
- Sets the current app on initialization

### App list (`src/AppList.tsx`)

Renders the list of discoverable applications, demonstrating how a portal enumerates and presents available apps.

## How to Run

```bash
pnpm install
pnpm dev
```

## What to Look At

| File               | What it demonstrates                                    |
| ------------------ | ------------------------------------------------------- |
| `src/index.tsx`    | Portal render contract — `render(el, modules)`          |
| `src/Framework.tsx`| `createFrameworkProvider` + app module configuration     |
| `src/AppList.tsx`  | Listing and rendering child apps inside a portal        |
| `src/config.ts`    | Application-level module configurator lifecycle hooks    |
