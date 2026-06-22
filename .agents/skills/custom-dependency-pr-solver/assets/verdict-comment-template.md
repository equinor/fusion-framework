# Dependency Update Verdict

| Signal | Notes |
|---|---|
| Recommendation | `<merge | hold | decline>` |
| Confidence | `<high | medium | low>` |
| Action | `<merged | skipped | needs review>` |

## Validation

| Check | Status | Notes |
|---|---|---|
| `pnpm build` | `<pass | fail | skipped>` | `<notes>` |
| `pnpm test` | `<pass | fail | skipped>` | `<notes>` |
| `pnpm -w check` | `<pass | fail | skipped>` | `<notes>` |

## Changesets

| Package | Bump | File |
|---|---|---|
| `@equinor/<name>` | `<patch | minor | major | none>` | `.changeset/<file>.md` |

## Assessment

- Security: `<clear | concern | blocking>` - `<detail>`
- Compatibility: `<clear | concern | blocking>` - `<detail>`
- Impact: `<clear | concern | blocking>` - `<detail>`

## Next Step

`<Merged via admin squash | skipped because ... | awaiting manual review because ...>`
