---
description: Rules for authoring repository-local agent skills
name: Skills Rules
applyTo: ".agents/skills/**/*.md"
---

# Skills Rules

## TL;DR (for AI agents)

- `.agents/skills/**` is treated as read-only catalog content unless the user explicitly asks you to modify it.
- Repo-owned skills belong under `.agents/skills/**`; do not add new repository skills under `.github/skills/**`.
- Do not edit repository-local skill files as part of routine repo greenkeeping or policy cleanup.
- Fix policy drift in `.github/instructions/*.md`, prompts, or adjacent repo documentation instead of patching the skill catalog.
- If this repository needs a persistent local overlay on top of imported skills, add a repo-owned custom skill named `custom-<repo-skill>` instead of modifying the imported skill entry.
- If a skill edit is explicitly requested, keep it minimal and avoid embedding repo-local contribution policy that belongs in `.github/instructions/*.md`.
- Use exact repository paths and casing when referencing templates or instruction files.

## Source of truth

Repository contribution policy lives in `.github/instructions/*.md`.
The `.agents/skills/**` catalog should be treated as imported or mirrored workflow content unless the user explicitly asks to work on that catalog.

## Default handling for `.agents/skills/**`

When you are working near the skill catalog:

1. Treat `.agents/skills/**` as read-only unless the user explicitly requests a skill-catalog change.
2. Put new repo-owned skills under `.agents/skills/**`, not `.github/skills/**`.
3. Put shared repo contribution rules in `.github/instructions/*.md`, not in skill files.
4. When a workflow or prompt needs shared mutation policy, reference `.github/instructions/workflow-contribution.instructions.md`.
5. Use exact repository paths and casing when referencing templates or instruction files.
6. When the repo needs a durable local workflow overlay, prefer adding a repo-owned `custom-<repo-skill>` entry over editing imported catalog skills.

## Greenkeeping guidance

- If a new repository-wide workflow rule is needed, add or update a `.github/instructions/*.md` file first.
- Prefer prompt, instruction, or documentation fixes over direct skill-catalog edits.
- When repo behavior must diverge from an imported skill in a repeatable way, add a repo-owned `custom-<repo-skill>` instead of patching the imported skill.
- If the user explicitly asks to update a skill, keep the change minimal and avoid duplicating repo policy that already exists elsewhere.

## Review-only workflow guidance

If you are reviewing workflow behavior without editing the skill catalog:

- call out missing changesets, missing validation, and weak PR bodies as findings,
- avoid silently repairing policy gaps inside `.agents/skills/**`,
- keep repo policy references concise and evidence-based.