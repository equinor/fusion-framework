import type { OpenApiMockOverride } from '@equinor/fusion-openapi-mock';
import type { MockOverride } from '../server/types.js';

/** One declarative `routes[path][method]` response or function-backed OpenAPI handler. */
export type RouteOverride = MockOverride | OpenApiMockOverride;
