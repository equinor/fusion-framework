# Fusion Framework Evaluation Index

Shared evaluation infrastructure for validating Fusion Framework MCP search retrieval quality. Domain files in this directory define expected search queries and what the index should return for each.

## How it works

Each **domain file** lists search queries as `##` headings. Under each heading, bullet points describe what the index **must** or **should** return. When evaluating, run the heading as a search query and check results against the expectations.

## Directory structure

```
eval/
  index/
    README.md            # This file
    core.md              # Modules, providers, initialization, events
    state-data.md        # State management and data flow
    context.md           # Context module patterns
    http-services.md     # HTTP clients and service layer
    dev-server.md        # Development server, mocking, proxying
    auth.md              # Authentication and authorization
    react-app.md         # React app bootstrap, hooks, sub-path APIs
    features.md          # Bookmarks, navigation, app loading, observability
    cli.md               # CLI commands, auth, deployment, portal templates
    utilities.md         # Observable state, event bus, Vite plugin
    routing.md           # React Router integration, route DSL, schema generation
    ag-grid.md           # AG Grid integration, theming, module registration
    widget.md            # Widget authoring, hosting, lifecycle events
    app-config.md        # Environment variables, app settings, module init
    cookbooks.md         # Cookbook discoverability, working examples
```

## Format

Each domain file follows this structure:

```markdown
# Domain Name

Judgement instructions for this domain — directed at you, the evaluator.
Ensure results reference the right packages. Verify symbols are real exports.
Reject results that contradict documented patterns.

## Search query as a natural question

- must mention X from `@equinor/fusion-framework-*`
- must show Y pattern or API
- should reference Z as related concept
```

The `#` heading names the domain. The paragraph below it tells the evaluator
how to judge results across all queries in that domain.
Each `##` heading is a search query. Bullets are expectations.

### Requirement levels

- **`must`** — the index must surface this for the query; absence means a gap
- **`should`** — the index should ideally surface this; absence is not critical

### Example

```markdown
# HTTP & Services

Ensure results reference `@equinor/fusion-framework-module-http` or
`@equinor/fusion-framework-module-service-discovery`. Verify that
package names, configuration helpers, and code examples are real.

## How to configure a named HTTP client

- must mention `configureHttpClient` from `@equinor/fusion-framework-module-http`
- must show `baseUri` and client name as parameters
- should mention default headers configuration
- should reference service discovery as an alternative
```

## How to contribute

1. Pick the right domain file
2. Add a `##` heading phrased as a natural question developers would search for
3. Add `must` and `should` bullets for what the index should return
4. Use real package names, exported symbols, and API names
5. Submit a PR

## Related
- **Evaluation skill:** `.agents/skills/custom-index-eval/` — run `eval core` or `eval all`
- **Framework instructions:** `.github/instructions/` — source-of-truth rules for code generation
