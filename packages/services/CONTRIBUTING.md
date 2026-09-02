# Maintaining @equinor/fusion-services

This guide is for repository maintainers adding services, adding API versions, or synchronizing
the package with an existing service contract. Consumer usage belongs in `README.md` and
`docs/<service>.md`.

## Design invariants

Preserve these rules when extending the package:

- Consumers import from `@equinor/fusion-services/<service>`, never the package root.
- Each operation is an independent endpoint function so tree shaking works at endpoint level.
- Each endpoint keeps its argument and response schemas in one version contract.
- API-specific schemas live under `<service>/<version>/schemas`.
- Zod schemas are the source of truth; TypeScript models use `z.infer` or `z.input`.
- Schema and field descriptions carry runtime domain context.
- API model names include the API version, such as `ApiRoleV1`.
- OpenAPI snapshots are complete, versioned, and updated manually after review.
- Endpoint modules do not import runtime barrels or registries.

## Add a service

1. Create `src/<service>/` with:

   ```text
   src/<service>/
   ├── endpoints/
   ├── v1/
   │   ├── openapi.json
   │   ├── schemas/
   │   └── types.ts
   ├── __tests__/
   ├── index.ts
   └── static.ts
   ```

2. Add one endpoint module per OpenAPI operation. Follow the
   `<resource>.<http-verb>.ts` naming used by Roles.
3. Define the endpoint's supported versions, version contract, argument schema, response schema,
   path builder, request options, and exported curried function in that module.
4. Add meaningful `.describe()` metadata to each Zod schema and field after
   `.optional()`, `.nullish()`, or other wrappers.
5. Infer API model types from their schemas and expose them through the version's type-only
   `types.ts` barrel.
6. Export endpoint functions and types from `src/<service>/index.ts`. Do not add a package-root
   service barrel.
7. Add `./<service>` and `./<service>/v1/openapi.json` to `package.json` exports and
   `typesVersions`.
8. Add the service and each supported API version to `scripts/openapi-services.ts`.
9. Add `docs/<service>.md` with the smallest working usage, common domain tasks, version behavior,
   runtime validation, and OpenAPI snapshot import.
10. Add a changeset for the new consumer-facing API.

## Add an API version

Treat a new service API version as an additive schema graph, not a mutation of the existing
version:

1. Add the concrete version to the service's `ApiVersion`.
2. Create `src/<service>/v<version>/` with its own complete OpenAPI snapshot, schemas, and
   type-only barrel.
3. Name schemas and models with the new version suffix.
4. Add the new version entry only to endpoints published by that contract.
5. Add path/request branches for the new version and widen each affected endpoint's supported
   version union.
6. Add a versioned OpenAPI package export and drift-check registry entry.
7. Extend compile-time tests to prove argument and response discrimination between versions.

Do not make a v2 endpoint depend on v1 schemas merely because the shapes currently match. Separate
graphs prevent a future v1 correction from silently changing v2 behavior.

## Check an existing OpenAPI contract

The drift command is read-only and takes the service name:

```sh
pnpm --filter @equinor/fusion-services check:openapi roles
```

Exit codes are:

| Code | Meaning |
| --- | --- |
| `0` | Every registered snapshot matches the live contract |
| `1` | Contract drift was detected |
| `2` | The check could not run because of input, configuration, fetch, or document errors |

The checker compares normalized documents and reports operation, component schema, and top-level
contract changes. It does not update files.

## Synchronize an OpenAPI snapshot

When drift is detected:

1. Review the reported operation, component schema, security, server, tag, and metadata changes.
2. Retrieve the live document from the URL registered in `scripts/openapi-services.ts`.
3. Sort JSON object keys while preserving array order, then replace only the matching versioned
   `openapi.json`.
4. Update endpoint modules for added, removed, or changed operations.
5. Update the matching version's Zod schemas and inferred types for contract changes.
6. Preserve useful OpenAPI descriptions with Zod `.describe()` metadata and exported TSDoc.
7. Update the service's operation mapping fixture when operations changed.
8. Run the drift check again; it must report the snapshot in sync.
9. Add a changeset describing the consumer-visible effect.

Updating the snapshot alone does not update endpoint or schema code. Never accept drift by merely
replacing the JSON file.

## Keep tests maintainable

Test behavior and package invariants rather than source formatting:

- Keep operation coverage synchronized with the OpenAPI snapshot.
- Test representative GET and mutation request behavior.
- Test version discrimination at runtime and compile time.
- Verify runtime Zod descriptions through schema discovery.
- Keep one coarse retrieval probe for documentation discoverability.
- Let `fusion-lint` enforce TSDoc structure, naming, and intent comments.

Avoid tests that parse examples, count formatting tokens, duplicate lint rules, or enumerate
symbols that can be discovered from the service tree.

## Validate a change

Run targeted tests while developing, then validate the package:

```sh
pnpm --filter @equinor/fusion-services build
pnpm exec vitest run --project '*fusion-services*'
pnpm exec biome check packages/services
pnpm exec fusion-lint packages/services
pnpm --filter @equinor/fusion-services check:openapi <service>
git diff --check
```

The OpenAPI check requires network access and is intentionally separate from the offline test
suite.
