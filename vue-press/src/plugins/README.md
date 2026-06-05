---
title: Plugins
category: Plugin
tag:
  - plugins
  - extension
  - intent
---

Plugins extend an existing Fusion Framework host with behavior that is optional, targeted, and intent-driven.

Use this section when you need to answer questions like:

- What is a plugin in Fusion Framework?
- Why would I use a plugin instead of a module?
- What behavior does this plugin add to an existing portal or app?

## What Is A Plugin?

A plugin is an add-on that hooks into an already configured Fusion Framework host and contributes one focused behavior.

The key intent is extension, not foundation. A plugin does not usually define a new core runtime capability the way a module does. Instead, a plugin composes with modules that are already present and adds cross-cutting behavior such as URL reconciliation, diagnostics, policy enforcement, or host-specific workflows.

In practice, a plugin is a good fit when the behavior is:

- Optional for the host
- Focused on one workflow or concern
- Built on top of existing module instances
- Easier to enable or disable as a single unit

## Why Use A Plugin?

Use a plugin when you want to capture host intent clearly.

If the host intent is "add this behavior to the portal," a plugin is often the better abstraction than pushing that behavior down into a general-purpose module. That keeps the core module graph smaller and makes the host configuration easier to read.

Plugins are useful because they:

- Make optional behavior explicit in host configuration
- Keep cross-cutting concerns separate from core modules
- Encapsulate one integration pattern behind a small enable/configure surface
- Let portal authors express intent directly: enable this behavior, for this host, with these rules

## Plugin Intent vs Module Intent

Modules and plugins can both affect runtime behavior, but they communicate different intent.

| Surface | Primary intent | Typical role |
|---|---|---|
| **Module** | Provide a core capability | State, services, routing, auth, events, telemetry |
| **Plugin** | Extend a host with focused behavior | Reconciliation, host policies, workflow glue, optional host features |

If your intent is "the framework needs this capability to exist," that usually belongs in a module.

If your intent is "this host should apply this behavior on top of existing capabilities," that usually belongs in a plugin.

## Available Plugins

- [Context Navigation](./context-navigation/)

## Current Plugin

### Context Navigation

The `@equinor/fusion-framework-plugin-context-navigation` package captures a very specific host intent:

keep the browser URL synchronized with the active app context.

It does not replace the context module or navigation module. It composes them. The plugin observes app and context state, chooses the right URL adapter, and applies URL updates consistently for the portal host.

That is a strong plugin fit because the intent is host-level behavior built on top of existing modules rather than a new foundational capability.