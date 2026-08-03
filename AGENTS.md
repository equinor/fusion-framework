## AI Agent Guide for Fusion Framework

Entry point for any AI agent (Copilot, Cursor, Codex) working in this repository.
Read this first, then load **only** the instruction file that matches what you are touching.

---

## Read this before searching

**[`CODEMAP.md`](CODEMAP.md)** — package map, task routing table, commands.

Most token waste in this repository comes from agents rediscovering where code lives.
The code map already answers that. Escalate in this order and stop as soon as you can act:

1. `CODEMAP.md`
2. Fusion MCP retrieval index (`fusion-framework`, `fusion-docs`, `eds`)
3. Targeted `grep` on a path the code map gave you
4. Semantic search across the workspace

Do not start at step 4. Do not repeat a search whose results you already have.

---

## Context discipline

- Work from the diff, the failing test, or the named file — not from the whole package.
- Read a file **once**, in one large range, rather than many small reads.
- Prefer `pnpm build:affected` and `--project`-scoped Vitest runs over full-repo builds.
- If you already know enough to make the change, make it. Stop exploring.
- Never re-read an instruction file you have already loaded in this session.

---

## What you are working with

- **TypeScript monorepo**, 58 published `packages/*` libraries plus `cookbooks/*` examples.
- **Strict TypeScript**: no `any` in new code, explicit return types, TSDoc on exported APIs.
- **React**: function components only; loading and error states handled explicitly.
- **Tooling**: `pnpm` only, Biome for lint/format, Vitest for tests, Changesets for versioning.

Treat every `packages/*` project as a library that will be published.

---

## Instruction routing

Load the file whose `applyTo` matches your target. Do not load the rest.

| You are touching | Load |
| --- | --- |
| Any `.ts` / `.tsx` | `.github/instructions/code-generation.instructions.md` |
| `packages/**` | `.github/instructions/monorepo-structure.instructions.md` |
| `cookbooks/**` | `.github/instructions/cookbooks.instructions.md` |
| `.tsx` / `.jsx` | `.github/instructions/react.instructions.md` |
| `*.test.ts(x)` | `.github/instructions/testing.instructions.md` |
| `**/*.md` | `.github/instructions/documentation.instructions.md` |
| `.changeset/**` | `.github/instructions/changesets.instructions.md` |
| A pull request | `.github/instructions/pull-requests.instructions.md` |
| A code review | `.github/instructions/code-review.instructions.md` |
| A Dependabot PR | `.github/instructions/dependabot-pr.instructions.md` (**mandatory, in full**) |
| `.agents/skills/**` | `.github/instructions/skills.instructions.md` |
| A workflow-driven commit or PR | `.github/instructions/workflow-contribution.instructions.md` |
| A `fusion-lint` diagnostic you cannot satisfy | `contributing/fusion-lint.md` |

Each instruction file opens with a TL;DR for agents. Read that; read the rest only if the
TL;DR does not resolve your question.

If rules conflict, the more specific `applyTo` wins.

---

## Reusable prompts

`.github/prompts/` holds prompts for the workflows that recur here:

| Prompt | Use for |
| --- | --- |
| `changeset.prompt.md` | Writing changesets for everything on the current branch |
| `release-recovery.prompt.md` | A release that tagged packages but did not publish them |
| `dependabot.prompt.md` | Reviewing or batch-processing Dependabot PRs |

---

## Non-negotiables

- **Package manager**: `pnpm` only. Never `npm` or `yarn`.
- **Imports**: scoped package names (`@equinor/fusion-framework-*`). Never cross-package
  relative imports. `workspace:^` belongs in `package.json`, never in source.
- **Types**: no `any` in new code. Explicit return types on exported symbols.
- **Docs**: TSDoc on every exported function, class, and component. TSDoc, READMEs, docs,
  and cookbooks are indexed for retrieval — write them for both humans and semantic search.
- **Tests**: Vitest, co-located, covering happy path, error path, and async behavior.
- **Changesets**: required for any change to `packages/*`, `cookbooks/*`, or consumer-facing
  docs. Not required for repo-internal markdown, tooling, or CI.
- **Comments**: only where they explain *why*. Never restate the code.

---

## Safety and consent

Ask before:

- force pushing, rebasing, or deleting branches
- merging any PR, including Dependabot PRs
- posting PR or issue comments
- refactors that span multiple packages

Take local, reversible actions (editing files, running tests, building) without asking.

When genuinely unsure which rule applies, ask rather than guess — a wrong guess costs more
than a question.

---

## Keeping this useful

When you change a pattern, a package layout, or a command, update `CODEMAP.md` and
the relevant instruction file in the same change. A stale code map sends every future agent
back to full-repo search.

`pnpm verify:agent-context` checks the code map against the real workspace — package list,
package count, routing paths, documented scripts, and instruction frontmatter. CI runs it on
any PR that touches those files. Run it locally after adding or renaming a package.
