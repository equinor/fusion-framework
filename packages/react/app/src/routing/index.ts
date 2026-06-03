/**
 * Routing sub-path entry-point for `@equinor/fusion-framework-react-app`.
 *
 * Re-exports the full public API of `@equinor/fusion-framework-react-router`
 * and its route builder DSL so consumers can import all routing primitives
 * from a single entry point without adding a separate direct dependency.
 *
 * Requires `@equinor/fusion-framework-react-router` to be installed.
 * It is declared as an optional peer dependency — install it only when
 * you need routing in your app, portal, or widget.
 *
 * @example
 * ```ts
 * import { Router } from '@equinor/fusion-framework-react-app/routing';
 * import { layout, index, route } from '@equinor/fusion-framework-react-app/routing';
 * ```
 *
 * @packageDocumentation
 */
export * from '@equinor/fusion-framework-react-router';
export * from '@equinor/fusion-framework-react-router/routes';
