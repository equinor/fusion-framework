---
description: Create changesets for the changes on the current branch
name: Changeset Prompt
---

# Write changesets for this branch

Follow `.github/instructions/changesets.instructions.md` for bump types, naming, and wording.

## Steps

1. Determine what actually changed:

   ```bash
   git diff --name-status origin/main...HEAD
   ```

2. Map changed files to workspace packages. A file under `packages/<a>/<b>/src/**` belongs to
   the package declared in the nearest `package.json`, not the directory name.

3. Decide which changes need a changeset:
   - `packages/*` or `cookbooks/*` source change → yes
   - consumer-facing `.md` (package README, docs page) → yes, against `@equinor/fusion-framework-docs`
   - repo-internal markdown, CI, tooling, test-only → no

4. Check what already exists in `.changeset/` so you do not duplicate an entry.

5. Write one file per package as `.changeset/{package-name-without-scope}_{short-description}.md`.

6. Verify the frontmatter package names resolve:

   ```bash
   pnpm changeset status --since origin/main
   ```

## Rules

- Write the summary for the **consumer** of the package, not for the reviewer of the diff.
- A breaking change needs `major` **and** migration notes with a before/after snippet.
- Do not group packages in one changeset unless the change and the message are genuinely identical.
- Never invent an issue number. Reference one only if the branch or PR already cites it.
