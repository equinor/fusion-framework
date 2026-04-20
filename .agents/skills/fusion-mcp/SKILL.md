---
name: fusion-mcp
description: Explain what Fusion MCP is and guide users through setting it up when they need Fusion-aware MCP capabilities in Copilot workflows.
license: MIT
metadata:
  version: "0.1.2"
  status: experimental
  owner: "@equinor/fusion-core"
  tags:
    - fusion
    - mcp
    - setup
  mcp:
    suggested:
      - github
---

# Fusion MCP Setup Guide

## When to use

Use this skill when a user asks:
- what Fusion MCP is
- what it can do
- how to install/configure it
- how to verify that it is working
- how to troubleshoot a failing Fusion MCP setup

Typical triggers:
- "what is fusion mcp"
- "help me set up fusion mcp"
- "how do I use fusion mcp with copilot"

## When not to use

Do not use this skill for:
- implementing product features unrelated to MCP setup
- making destructive environment changes without user confirmation
- assuming private repository details that are not visible
- answering source-backed questions about Fusion Framework APIs, EDS components, or the skill catalog — once MCP is running, use `fusion-research` for that

## Required inputs

Collect before proposing setup steps:
- user environment (OS, shell, editor/runtime)
- target client where MCP will run (for example VS Code MCP config or terminal)
- whether the user wants released image (GHCR) or local build from source
- transport mode (`stdio` for editor client config or HTTP endpoint for local checks)
- whether required access is ready (Docker, GitHub auth for GHCR, API keys)

If details are missing, ask concise follow-up questions first.

## Instructions

1. Explain what this MCP server provides:
   - Fusion-oriented MCP capabilities for retrieval and workflow support
   - tool surface may evolve over time as the server is a PoC
   - examples today may include retrieval, index guidance, metadata summaries, and skill discovery
   - retrieval tools: `search_framework`, `search_docs`, `search_eds`, `search_skills`, `search_indexes`
   - skill advisory: `skills`, `skills_index_status`
2. Use the official README quick start as source of truth, then present a minimal 2-step setup path:
   - choose image source: GHCR release image or local build
   - configure VS Code MCP using Docker `stdio` only (scope for this iteration)
3. For GHCR image setup, include auth prerequisites before pull/run:
   - `gh auth login -h github.com -w`
   - `gh auth refresh -h github.com -s read:packages`
   - `gh auth token | docker login ghcr.io -u <github-username> --password-stdin`
4. For local build setup, use the documented sequence so the API is built, started, and validated:
   - `cp .env.example .env`
   - `docker compose up -d --build api`
   - then follow the health-check step in `references/local-http-quickstart.md` to confirm the API is healthy
5. Provide required configuration categories without exposing secret values:
   - Azure Search keys (`AzureSearch__*`)
   - Foundry keys/settings (`Foundry__*`)
   - optional runtime vars (`ASPNETCORE_ENVIRONMENT`, `HOST_PORT`)
6. Provide a lightweight MCP smell test:
   - run `initialize` and confirm a successful response
   - run `tools/list` and confirm at least one tool is returned
   - run one non-destructive `tools/call` against an available tool
   - pass criteria: call response is non-empty (`content` or `structuredContent` contains data)
   - note: do not hard-code a fixed tool list; tool inventory can change between versions
7. Troubleshoot in documented order:
   - GHCR `unauthorized`/`403` -> refresh GH auth and Docker login
   - Apple Silicon manifest mismatch -> add Docker arg `--platform linux/amd64`
   - `tools/list` returns empty or basic query fails -> re-check API key env mapping and MCP server selection in VS Code
   - startup looks healthy but tool behavior is partial -> re-check env/config/auth alignment and restart MCP server
8. When MCP setup fails, MCP behavior is incorrect, or the user asks to file a bug, produce a bug report draft from `assets/bug-report-template.md`.
   - default target repository: `equinor/fusion-poc-mcp`
   - include concrete repro steps, expected vs actual behavior, and troubleshooting already attempted
   - include non-sensitive environment details (OS, VS Code version, Docker version, image tag, transport mode)
   - never include secrets, API keys, or raw token values
9. For uncertainty or repo-private constraints, state assumptions explicitly and link to authoritative docs instead of guessing.

## Expected output

Return:
- short explanation of Fusion MCP and when to use it
- setup path tailored to the user environment (GHCR/local, `stdio`/HTTP)
- minimal validation checklist with concrete pass criteria
- troubleshooting steps mapped to observed error symptoms
- bug report draft (when setup fails/misbehaves or user requests) using `assets/bug-report-template.md` with default target `equinor/fusion-poc-mcp`
- script snippets when user asks for copy/paste automation aids
- assumptions and missing information called out explicitly
- links to the exact upstream docs used

## References

- [references/README.md](references/README.md)
- [assets/bug-report-template.md](assets/bug-report-template.md)

## Safety & constraints

Never:
- request or expose secrets, tokens, or credentials
- invent setup commands that are not supported by project documentation
- claim setup succeeded without validation output
- run destructive commands without explicit user confirmation

Always:
- prefer official repository documentation as source of truth
- provide least-privilege, minimal-change setup guidance first
- separate confirmed facts from assumptions
- keep guidance scoped to VS Code + Docker for this iteration
