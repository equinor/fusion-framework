---
title: "Add CLI command to create apps from templates"
branch: "001-cli-create-app-from-template"
date: "2025-01-27"
spec: "./spec.md"
input: "Feature specification from /specs/001-cli-create-app-from-template/spec.md"
---

# Implementation Plan: Add CLI command to create apps from templates

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
4. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, or `GEMINI.md` for Gemini CLI).
6. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
7. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
8. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Add a new CLI command `fusion create app <app-name>` that clones templates from the `equinor/fusion-app-template` repository, supports interactive template selection, and provides optional dependency installation and development server startup.

## Technical Context
**Language/Version**: TypeScript 5.0+ (existing CLI package)  
**Primary Dependencies**: Commander.js, inquirer, execa, chalk, ora, fs-extra, gh CLI  
**Storage**: File system (temporary cloning, local app directories)  
**Testing**: Vitest (existing framework testing setup)  
**Target Platform**: Node.js CLI tool  
**Project Type**: single (CLI library extension)  
**Performance Goals**: App creation in under 30 seconds  
**Constraints**: Must work offline after initial template clone, <50MB memory usage  
**Scale/Scope**: Single CLI command, 10+ template types, 100+ developers  

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:
- Projects: [1] (CLI package extension only)
- Using framework directly? (yes, extending existing CLI)
- Single data model? (yes, app creation workflow)
- Avoiding patterns? (yes, direct file operations, no unnecessary abstractions)

**Architecture**:
- EVERY feature as library? (yes, CLI command as library function)
- Libraries listed: [fusion-framework-cli - CLI command library]
- CLI per library: [create app command with --help/--version/--template/--default/--debug flags]
- Library docs: TSDoc format for all exported functions

**Testing (NON-NEGOTIABLE)**:
- RED-GREEN-Refactor cycle enforced? (yes, tests before implementation)
- Git commits show tests before implementation? (yes)
- Order: Contract→Integration→E2E→Unit strictly followed? (yes)
- Real dependencies used? (yes, actual file system, real git operations)
- Integration tests for: new CLI command, template cloning, error handling?
- FORBIDDEN: Implementation before test, skipping RED phase

**Observability**:
- Structured logging included? (yes, using existing CLI logging)
- Frontend logs → backend? (N/A - CLI tool)
- Error context sufficient? (yes, clear error messages for all failure cases)

**Versioning**:
- Version number assigned? (patch version bump for CLI package)
- BUILD increments on every change? (yes)
- Breaking changes handled? (N/A - new feature, no breaking changes)

## Project Structure

### Documentation (this feature)
```
specs/001-cli-create-app-from-template/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── interfaces/          # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Option 1: Single project (DEFAULT)
packages/cli/
├── src/
│   ├── commands/
│   │   └── create-app.ts
│   ├── lib/
│   │   ├── template-cloner.ts
│   │   ├── app-validator.ts
│   │   └── interactive-prompts.ts
│   └── bin/
└── tests/
    ├── contract/
    ├── integration/
    └── unit/
```

**Structure Decision**: Option 1 - Single project (CLI library extension)

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - Template cloning strategy and GitHub CLI integration
   - Interactive prompt library selection and UX patterns
   - Error handling patterns for CLI tools
   - File system operations and cleanup strategies

2. **Generate and dispatch research agents**:
   ```
   Task: "Research GitHub CLI integration for template cloning in Node.js"
   Task: "Find best practices for interactive CLI prompts in TypeScript"
   Task: "Research error handling patterns for CLI tools with file operations"
   Task: "Find best practices for temporary file management and cleanup"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - ApplicationTemplate entity (name, source, description)
   - ApplicationInstance entity (name, path, template, status)
   - CreationOptions entity (template, install, start, open, cleanup)

2. **Generate service interfaces** from functional requirements:
   - CLI command interface specification
   - Service interface definitions
   - TypeScript interface contracts
   - Output interface definitions to `/interfaces/`

3. **Generate interface tests** from interfaces:
   - CLI command test file
   - Service interface test files
   - Assert interface contracts
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh copilot` for your AI assistant
   - Add CLI development patterns and template cloning
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /interfaces/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P] 
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:
- TDD order: Tests before implementation 
- Dependency order: Models before services before CLI commands
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | No violations detected | All requirements fit within single CLI library extension |

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*