---
title: RoadMap
category: Planning
tag: 
  - WIP
---

- <Badge type="tip" text="Complete"/>
- <Badge type="warning" text="Minimum viable product"/>
- <Badge type="info" text="Active - Currently working on"/>
- <Badge type="note" text="Planned - not started on"/>

::: note
Some task for planned feature are skipped to meet the dead-line of **Project Portal**
:::

## Authentication <Badge type="tip" text="Q1 2022"/>

Core of the **Fusion Framework** is to provide tooling for executing authenticated service requests.

Developers of the **Fusion platform** should with minimal effort consume **Fusion Services** and provide their own.

Developers should be able to configure named clients for services. When using the client it should acquire scoped user identity token for the requested endpoint.

The client should also internally expose requests and responses, which can be managed from the portal (example telemetry, custom headers)

> initial modules for moving from ADAL to MSAL

- [x] configure and create http clients 
- [x] MSAL authentication 
- [x] [documentation](../modules/http)


## Foundation <Badge type="tip" text="Q2 2022"/>

**Fusion Framework** is buildt on a modular design.
> Functionality for apps and portals composed together by small building block called modules
>
> The framework provides essential modules, but developers can pick or create additional modules needed.

**Fusion Framework** provides scoped functionality.
> Each collection module instances has their own _sandbox_ to not pollute other applications.
>
> When a applications is ejected, all facilitated functionality is disposed.

**Fusion Framework Modules** are independent and should be interchangeable.
> **Example:** if the technology for authentication changes, 
> only the authentication module should be replaced.

**Fusion Framework** is ecosystem independent.
> Written in plain TypeScript for future upgrade of libraries or platforms
>
> Tooling for easy development on React

**Fusion Framework** is the foundation of applications
> `build once, run anywhere`, **Fusion Apps** should run on any host(portal).
>
> developers can focus more on UI, framework handles complexity

- [x] create functionality for adding, configuring and initializing modules.
- [x] create interface with collection of essential modules (app and portal)  
- [x] add type-hinting for working with framework in IDE
- [x] tooling for `React`
- [x] [documentation](../modules/README.md)
- [x] guide

## Service Discovery <Badge type="warning" text="Q2/Q3 2022"/>

Applications consumes data from **Fusion** services.
The **Framework** should dynamically resolve services from the host portal. 

Developers should easily configure which services the application needs and maintainers see which one are used.
> developers should only name the service, then the framework resolves the endpoint and authentication requirements

- [x] create a module which resolves `http` clients
- [x] tooling for `React`
- [x] [documentation](../modules/service-discovery/README.md)
- [ ] guide
- [ ] cookbook

## Ag Grid <Badge type="tip" text="Q3 2022"/>

Allow application to register `AgGrid` license for removing watermark.

- [x] [documentation](../modules/ag-grid/README.md)
- [x] guide
- [ ] cookbook

## Events <Badge type="warning" text="Q3 2022"/>

Since modules are decoupled, the **Framework** needs a bus to communicate on.
> Application can interact with events and prevent default behaviors

- [x] create a module for consuming context
- [x] tooling for `React`
- [x] [documentation](../modules/event/README.md)
- [ ] guide
- [ ] cookbook


## Context <Badge type="warning" text="Q3 2022"/>

**Fusion** context is scoped data with user-friendly name and follows users throughout session.

Applications present the user with a interface related the to selected context. 

The framework needs to facilitate query, filtering and selecting scoped data.
> The framework maintains the cache of context, aborts dangling request and throttles queries

![GitHub milestone](https://img.shields.io/github/milestones/progress-percent/equinor/fusion-framework/1)
- [x] create a module for consuming context
- [ ] update context handling in **Fusion Portal**
- [x] [documentation](../modules/services/context)
- [x] tooling for `React`
- [ ] guide
- [ ] cookbook



## Application Loading <Badge type="info" text="Q4 2022"/>

**Fusion** provides metadata about registered applications and configuration for runtime environment.
When loading an application the **Framework** resolves and provides this information, 
which the application uses to dynamically configure before rending.

The framework also keeps track of selected application and notifies when when current application changes.

- [x] load application and keep track of selected
- [x] tooling for `React`
- [ ] developer documentation
- [ ] developer guide
- [x] cookbook for loading applications
- [ ] _track usage (awaiting new service)_



## Bookmarks <Badge type="info" text="Q4 2022"/>

Bookmarks are snapshots of application states which users can navigate to and share with other Fusion users.
The framework should facilitate functionality for storing and restoring bookmark.

- [x] configurable interface for storing and restoring bookmarks
- [ ] tooling for `React`
- [ ] Cookbook for developing bookmarks
- [ ] Developer documentation



## Widgets <Badge type="note" text="Q4 2022"/>

Widgets are small applications which are uploaded to an global storage and consumed by portals and applications.
The framework should manage loading metadata and configuration for the widget. 

- [ ] Load widget manifest and configuration
- [ ] tooling for `React`
- [ ] Documentation
- [ ] Guide
- [ ] Cookbook



## Application migration <Badge type="note" text="Q4 2022"/>
__Q4 2022__

Convert existing application to be compatible with dynamic loading and configuration of framework

- [ ] create build template for building application
- [ ] create a wrapper for emulating portal in development
- [ ] create guide for making application compliant with `Fusion Framework` 
- [ ] make Fusion Portal compliant with `React 18` 

## Navigation <Badge type="info" text="Q4 2022"/>
__Q4 2022__

The **Framework** should provide functionality for applications and portals for navigating.

![GitHub milestone](https://img.shields.io/github/milestones/progress-percent/equinor/fusion-framework/7)

- [x] create functionality for building scoped urls
- [x] create module for creating router
- [ ] create documentation
- [ ] observe changes to routing

## Application CLI <Badge type="info" text="Q4 2022"/>
__Q4 2022__

Create a CLI for building and developing application

![GitHub milestone](https://img.shields.io/github/milestones/progress-percent/equinor/fusion-framework/4)

- [x] create a CLI for developing application
- [ ] create application builder
- [x] create proxy-server for emulating portal (manifest, config)
- [x] add routing to CLI portal
- [ ] add __context__ selector and provider to CLI portal 
- [ ] add __person__ provider to CLI portal
- [ ] support configuration of portal framework (auth and service discovery) 

# Not planned yet


## Tasks <Badge type="warning" text="need grooming"/>

Exposes users Fusion tasks/actions


## Notification <Badge type="warning" text="need grooming"/>

Exposes users Fusion notifications


## Telemetry

Observer events happening in the framework an log back to application insight

> This module exists but missing wiring and final touches

- [ ] subscribe to framework events
- [ ] tooling for `React`
- [ ] Documentation
- [ ] Guide
- [ ] Cookbook


## Service Messages <Badge type="warning" text="need grooming"/>

Module for subscribing to **Fusion** service messages (SignalR) 

- [ ] tooling for `React`
- [ ] Documentation
- [ ] Guide
- [ ] Cookbook


## Person <Badge type="warning" text="need grooming"/>

Module for resolving persons (person-card, person-picker, person-avatar, person-availability)


## Dynatrace <Badge type="warning" text="need grooming"/>

