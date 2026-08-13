---
"@equinor/fusion-framework-cookbook-app-react-router": patch
---

Add an OpenAPI-mock–backed test fixture (`testWithApiMock`) for full-router integration tests, so route/loader tests get deterministic, schema-shaped mock API responses instead of hand-written fixtures.

- `src/mocks/generators.ts`: seeded Faker.js generators shared by the dev server and the test mock (extracted from `dev-server.config.ts`, which now imports them instead of duplicating the logic).
- `src/mocks/openapi.json`: OpenAPI document describing the products/users API contract.
- `src/mocks/fields.faker.ts`: a sidecar `FieldFakerMap` demonstrating field-level fake data overrides.
- `src/mocks/api-mock.ts`: builds an `OpenApiMock` (`@equinor/fusion-openapi-mock`) with per-operation overrides backed by the shared generators, including real pagination for `listUsers`.
- `src/__tests__/test-with-api-mock.ts` + `src/__tests__/routing-with-api-mock.test.tsx`: a `configure` fixture extension wiring the mock in via `configurator.http.addMiddleware(createOpenApiMockMiddleware(...))`, and 3 full-router tests navigating to `/products`, `/products/:id`, and `/users`.
