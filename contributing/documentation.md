# Documentation System

Standards and workflows for maintaining Fusion Framework markdown documentation.

## Quick Reference

| Task | When | Command/Location |
|------|------|------------------|
| Update READMEs | API/functionality changes | `packages/*/README.md` |
| Add feature docs | New capabilities | `packages/*/docs/` |
| Test locally | Before PR | `cd vue-press && pnpm dev` |
| Validate build | Before merge | `pnpm build:docs` |
| Create changeset | Consumer-affecting changes | `.changeset/[name].md` |
| Check links | PR review | CI + manual verification |

**Key Rules:**
- Documentation lives with code in `packages/*/docs/` and `README.md`
- VuePress structure **must** mirror package structure exactly
- Use `<!-- @include: -->` directives to import package docs
- All docs use **pure GitHub-flavored Markdown**
- Follow conventional commits for documentation updates

## Architecture

The documentation system uses a **colocated architecture** where docs live alongside code and are imported into VuePress for publishing.

### File Structure
```
packages/
├── cli/
│   ├── docs/           # Feature-specific documentation
│   │   ├── application.md
│   │   └── auth.md
│   └── README.md       # Main package documentation
└── modules/http/
    ├── docs/          # Optional module docs
    └── README.md      # Main module documentation

vue-press/src/         # Mirrors packages/ structure exactly
├── cli/
│   ├── docs/
│   │   ├── application.md  # <-- @include: ../../../../packages/cli/docs/application.md
│   └── README.md           # <-- @include: ../../../packages/cli/README.md
└── modules/http/
    └── README.md           # <-- @include: ../../../../packages/modules/http/README.md
```

### VuePress Integration
VuePress imports package documentation using `<!-- @include: -->` directives:

```md
<!-- @include: ../../../packages/cli/README.md -->
```

**Critical:** VuePress structure in `vue-press/src/` must exactly mirror `packages/` structure for imports to work.

### Markdown Standards
- **Pure GitHub-flavored Markdown** for maximum compatibility
- No VuePress-specific syntax in source files
- Standard formatting for code blocks, tables, and links
- Frontmatter added by VuePress wrapper files only

See [GitHub's basic writing and formatting syntax](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax) for reference.

## Changesets for Documentation

**All documentation changes require a changeset** for `@equinor/fusion-framework-docs` to publish updated docs.

### Changeset Format

```md
---
"@equinor/fusion-framework-docs": patch
---

Improve documentation for framework configuration options with additional code examples and troubleshooting guide.
```

See [changeset.md](changeset.md) for complete guidelines and examples.

## Package Documentation Structure

Keep documentation with code using this standardized structure:

### Directory Layout
```
packages/
├── cli/
│   ├── docs/           # Feature-specific documentation
│   │   ├── application.md    # App development guide
│   │   ├── auth.md          # Authentication setup
│   │   └── migration-v10-to-v11.md  # Migration guides
│   └── README.md       # CLI overview, installation, quick start
├── modules/http/
│   ├── docs/          # Advanced usage docs (optional)
│   │   └── interceptors.md
│   └── README.md      # Module overview, basic usage
└── react/
    ├── docs/          # Framework-specific docs
    │   ├── hooks.md
    │   └── components.md
    └── README.md      # React integration guide
```

### Content Guidelines

**README.md** (Required for all packages):
- Package overview and purpose
- Installation instructions
- Basic usage examples
- API reference or links to detailed docs
- Migration guides for breaking changes

**docs/\*.md** (Optional, for complex packages):
- Feature-specific guides
- Advanced usage patterns
- API references
- Troubleshooting
- Migration documentation

**Critical:** VuePress structure in `vue-press/src/` must exactly mirror `packages/` structure for imports to work.

## Development Workflow

### Local Development
```bash
# Install all dependencies (from project root)
pnpm install

# Start documentation development server
cd vue-press && pnpm dev

# Build documentation for production
cd vue-press && pnpm build
```

### Validation & Testing
```bash
# Build all packages and docs (from project root)
pnpm build:all

# Build docs only
pnpm build:docs

# Validate documentation build
pnpm build:docs && echo "✅ Docs build successful"
```

### Making Documentation Changes

1. **Locate the source**: Find docs in `packages/*/README.md` or `packages/*/docs/`
2. **Make changes**: Edit markdown files directly
3. **Test locally**: Run `cd vue-press && pnpm dev` and verify changes
4. **Validate build**: Run `pnpm build:docs` before committing
5. **Create changeset**: If consumer-affecting, add `.changeset/[name].md`
6. **Commit**: Use conventional commit format (e.g., `docs: update cli installation guide`)

### Adding New Documentation

1. **Create files**: Add `README.md` and/or `docs/` directory to package
2. **Update VuePress**: Add corresponding files in `vue-press/src/` with include directives
3. **Test imports**: Verify `<!-- @include: -->` paths are correct
4. **Create changeset**: Required for new consumer-facing documentation

## Contributing Guidelines

### Documentation Quality Standards

**Content Requirements:**
- **Accuracy**: Technical information must be correct and current
- **Completeness**: Cover all public APIs and important use cases
- **Clarity**: Use simple language, avoid jargon unless explained
- **Examples**: Include practical code examples for key features
- **Structure**: Use consistent headings, lists, and formatting

**Technical Standards:**
- **GitHub-flavored Markdown**: No VuePress-specific syntax
- **Relative links**: Use relative paths within packages
- **Code blocks**: Include language identifiers (```typescript)
- **Cross-references**: Link to related documentation sections

### Writing Documentation

#### README.md Template
```md
# Package Name

Brief description of what this package does.

## Installation

```bash
pnpm add @equinor/package-name
```

## Quick Start

```typescript
import { Something } from '@equinor/package-name';

// Basic usage example
```

## API Reference

- [Detailed API docs](docs/api.md)
- [Configuration options](docs/config.md)

## Migration Guide

See [migration guide](docs/migration-v1-to-v2.md) for breaking changes.
```

#### Feature Documentation
- Start with problem/solution
- Include code examples
- Document edge cases
- Link to related features

### PR Review Checklist

#### Content Quality
- [ ] Documentation accurately reflects implementation
- [ ] Code examples are correct and runnable
- [ ] All public APIs are documented
- [ ] Breaking changes include migration guides

#### Technical Requirements
- [ ] README.md exists for new packages
- [ ] Files follow directory structure (`packages/*/docs/`)
- [ ] VuePress structure mirrors packages exactly
- [ ] `<!-- @include: -->` paths are correct
- [ ] `pnpm build:docs` passes without errors
- [ ] All internal links resolve correctly
- [ ] External links are valid and accessible
- [ ] Documentation builds successfully in CI

#### Changeset Requirements
- [ ] Changeset created for `@equinor/fusion-framework-docs`
- [ ] Changeset follows proper format (see [changeset.md](changeset.md))
- [ ] Changeset description is clear and descriptive

## Maintainer Workflows

### Maintenance Schedule
- **Daily**: Monitor CI for documentation build failures
- **Weekly**: Review open documentation PRs and issues
- **Monthly**: Run comprehensive validation and freshness checks
- **Quarterly**: Audit documentation coverage and update templates

### Issue Triage & Priority
- **🔴 Critical**: Build failures, broken imports, incorrect docs → Fix within 1 day
- **🟡 High**: Missing documentation, broken links, outdated examples → Fix within 1 week
- **🟢 Medium**: Content improvements, style issues, additional examples → Next sprint
- **🔵 Low**: Typos, formatting inconsistencies, minor improvements → Backlog

### Standards Enforcement
**Automated:**
- Link validation in CI
- Import path verification
- Build success confirmation

**Manual:**
- Technical accuracy review
- Completeness assessment
- Clarity and consistency checks

## Common Issues & Solutions

### Build Failures

**"Cannot find module" or "File not found"**
- **Cause**: VuePress structure doesn't mirror `packages/` exactly
- **Solution**: Ensure `vue-press/src/` has identical directory structure to `packages/`
- **Example**: If you have `packages/cli/docs/app.md`, you need `vue-press/src/cli/docs/app.md`

**Import errors with `<!-- @include: -->`**
- **Cause**: Incorrect relative paths in include directives
- **Solution**: Count `../` carefully from VuePress file to package file
- **Example**: From `vue-press/src/cli/README.md` to `packages/cli/README.md`:
  ```md
  <!-- @include: ../../../packages/cli/README.md -->
  ```

**Path separator issues**
- **Cause**: Using backslashes instead of forward slashes
- **Solution**: Always use forward slashes `/` in include paths
- **Command**: Run `pnpm build:docs` to validate all paths

### Content Issues

**Documentation doesn't appear in VuePress**
- **Cause**: Missing or incorrect frontmatter in VuePress wrapper files
- **Solution**: Ensure VuePress files have proper YAML frontmatter with title, description, etc.
- **Example**:
  ```yaml
  ---
  title: CLI Application Development
  description: Guide for developing applications with the CLI
  ---
  ```

**Broken internal links**
- **Cause**: Links work in GitHub but not in VuePress context
- **Solution**: Test links in VuePress dev server, use relative paths within packages
- **Tip**: Use `vue-press/src/` as root for internal navigation

**External links failing**
- **Cause**: URLs changed, redirects broken, or HTTPS requirements
- **Solution**: Manually verify URLs work, prefer HTTPS, update to new URLs
- **Prevention**: Check links before committing

### Structure Issues

**VuePress structure out of sync**
- **Cause**: Package structure changed without updating VuePress
- **Solution**: Keep `vue-press/src/` structure identical to `packages/`
- **Command**: Compare directory structures manually or with scripts

**Missing package documentation**
- **Cause**: New packages added without README.md
- **Solution**: All packages must have `README.md` in their root
- **Template**: Use the README.md template in Contributing Guidelines

**Slow documentation builds**
- **Cause**: Large imports or inefficient VuePress configuration
- **Solution**: Check for unnecessarily large includes, optimize config
- **Monitoring**: Watch build times and optimize as needed

### Content Quality Issues

**Outdated documentation**
- **Cause**: Code changes without documentation updates
- **Solution**: Update docs when APIs change, include migration guides
- **Prevention**: Review docs during code reviews

**Inconsistent formatting**
- **Cause**: Different authors using different styles
- **Solution**: Follow established patterns, use linters for consistency
- **Standards**: Pure GitHub-flavored Markdown, consistent heading levels

### Getting Help

**For Documentation Issues:**
1. **Check existing issues**: Search GitHub issues for similar problems
2. **Validate locally**: Run `cd vue-press && pnpm dev` to test changes
3. **Check build**: Run `pnpm build:docs` to catch import/build issues
4. **Create detailed reports**: Include error messages, file paths, and reproduction steps

**Escalation:**
- **Build failures**: Tag `@equinor/fusion-core` immediately
- **Content issues**: Create issues with "documentation" label
- **General help**: Use `#fusion-framework` Slack channel

---

## Success Criteria

**Technical Quality:**
- ✅ Zero build failures in CI
- ✅ All `<!-- @include: -->` directives resolve correctly
- ✅ VuePress structure perfectly mirrors `packages/` structure
- ✅ All internal and external links functional

**Content Quality:**
- ✅ Complete documentation coverage for all public APIs
- ✅ Accurate, current technical information
- ✅ Clear, well-structured content with examples
- ✅ Consistent formatting and style across packages

**Process Quality:**
- ✅ All documentation PRs include proper changesets
- ✅ Regular maintenance and freshness checks
- ✅ Comprehensive PR reviews with checklists
- ✅ Fast resolution of critical issues