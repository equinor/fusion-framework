# Available Dependabot PRs

| Age | # | Semver | Package |
|-----|---|--------|---------|
{{#prs}}
| {{age}} | #{{number}} | {{semver}} | {{package}} |
{{/prs}}

---

**How to use:**
1. Pick a PR number from the table above
2. Provide the number when prompted

**Legend:**
- **Age:** `new` (<1d) | `1w` (1-7d) | `2w` (1-2w) | `1m` (2-4w) | `stale` (>1m)
- **Semver:** `PATCH` (bug fixes) | `MINOR` (new features) | `MAJOR` (breaking changes)
- **Package:** `name@version` format

**Template Variables** (for data generation):
- `age`: Time bucket based on PR creation date
- `number`: GitHub PR number
- `semver`: Semantic versioning type
- `package`: Package name with new version (e.g., `rollup@4.55.2`)
