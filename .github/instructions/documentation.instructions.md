---
description: Rules for writing repository documentation used by developers and retrieval-driven code generation
name: Documentation Rules
applyTo: "**/*.md"
---

# Documentation Rules

## TL;DR (for AI agents)

- Treat consumer-facing markdown as product surface area, not filler.
- Treat `README.md`, published docs folders, and cookbooks as part of the repository retrieval corpus used for RAG and code generation.
- Write for two readers at the same time: a developer skimming for answers and a semantic retriever matching intent.
- Lead with what the thing is, when to use it, and how it fits into Fusion Framework.
- Use exact exported names, option names, package names, and domain terms at least once where they matter.
- Prefer task-oriented headings, short explanatory paragraphs, and small focused code examples over long code walls.

## Scope

These rules matter most for:

- package `README.md` files
- published docs under docs-style folders
- cookbooks and task guides
- consumer-facing markdown that will be indexed and reused by code-generation workflows

In this repository, all of the following are treated as retrieval assets:

- TSDoc in TypeScript source
- `README.md` files
- docs folders and published markdown docs
- cookbooks

That means documentation must be understandable to humans and also easy for semantic search to match accurately.

## Writing Goals

Every doc should help a reader answer these questions quickly:

1. What is this?
2. When should I use it?
3. How do I start?
4. What are the important concepts, tradeoffs, or gotchas?
5. What exact API names, package names, and configuration terms should I use?

## Structure Guidelines

Prefer this shape when the content is substantial:

1. Short summary of what the package, feature, or guide is
2. Mental model or key concepts
3. Quick start or smallest useful example
4. Common tasks or patterns
5. Reference details, constraints, errors, or edge cases

For cookbooks, prefer this shape:

1. Problem statement
2. When to use this approach
3. Minimal working example
4. Explanation of why it works
5. Tradeoffs, caveats, and related APIs

## Retrieval And Semantic Hit Rate

Write so a retriever can match both exact API queries and natural-language questions.

- Use the canonical package name, exported symbol names, option names, and protocol names exactly as they appear in code
- Also include the natural-language phrasing a developer would search for, such as `how to configure an HTTP client`, `how to stream SSE`, or `how to add request headers`
- Prefer descriptive headings like `Observable Patterns` or `Configure Named Clients` over vague headings like `Advanced Usage`
- Repeat critical terms naturally across summary, headings, and surrounding prose when the section is important
- Avoid keyword stuffing; clarity and precision matter more than density
- Use one concept per paragraph when practical so retrieval chunks stay coherent
- Explain relationships explicitly, such as handlers vs selectors, promises vs observables, or named clients vs ad-hoc clients

## Style Guidelines

- Lead with direct statements, not marketing language
- Prefer short paragraphs before examples so readers know why the code matters
- Keep examples minimal but realistic enough to be reusable
- Break large examples into multiple smaller examples when they teach distinct ideas
- Use bullet lists for choices, behaviors, constraints, or gotchas
- Use tables when comparing APIs, options, or error types
- State defaults and edge cases explicitly
- For user-facing APIs, mention the expected input shape and output shape in prose even if the code example also shows it

## README Expectations

Package READMEs should usually answer all of the following:

- what the package is responsible for
- who should use it
- the simplest successful path
- the main exported entry points
- the core mental model
- common usage patterns
- important constraints, defaults, and error behavior

If the package exposes both beginner and advanced paths, say so explicitly and route readers to the simplest one first.

## Cookbook Expectations

Cookbooks should optimize for action and adaptation.

- Name the task clearly
- Show the smallest working path first
- Explain which parts are essential and which parts are optional
- Mention adjacent APIs or alternative approaches when that helps selection
- Call out assumptions about auth, environment, framework setup, or data shape

## Anti-Patterns

- Do not write documentation as a wall of code with little or no explanation
- Do not describe APIs only in abstract terms without showing where or when they are useful
- Do not rely on pronouns when exact symbol names would be clearer
- Do not hide key constraints, defaults, or failure behavior only inside examples
- Do not let README or cookbook content drift away from the real exported API surface