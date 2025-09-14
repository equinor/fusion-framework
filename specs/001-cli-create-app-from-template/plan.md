---
title: "Implementation Plan: Add CLI command to create apps from templates"
branch: "001-cli-create-app-from-template"
date: "2025-01-27"
spec: "spec.md"
input: "/specs/001-cli-create-app-from-template/spec.md"
status: "Implemented"
---

# Implementation Plan: Add CLI command to create apps from templates


## Summary
✅ **IMPLEMENTED**: Added CLI command `fusion create app <app-name>` that clones templates from the `equinor/fusion-app-template` repository and creates new Fusion Framework applications with interactive prompts for template selection, dependency installation, and development server startup.

**Key Features Implemented**:
- Template repository cloning and management
- Interactive template selection with fallback to single template
- Target directory validation and cleanup options
- Dependency installation with package manager selection (pnpm/npm)
- Development server startup
- IDE opening (VS Code/Cursor)
- Comprehensive error handling and logging

## Technical Context
**Language/Version**: TypeScript 5.0+ with Node.js 22+  
**Primary Dependencies**: Commander.js, Inquirer.js, simple-git, Node.js fs/spawn APIs  
**Storage**: File system operations (clone, copy, create directories)  
**Testing**: Vitest for contract tests  
**Target Platform**: Cross-platform CLI (Windows, macOS, Linux)  
**Project Type**: Single (CLI tool)  
**Performance Goals**: <5 seconds for template creation, <30 seconds for dependency installation  
**Constraints**: Must work offline after initial template clone, handle network failures gracefully

**Actual Implementation**:
- Uses `simple-git` for repository cloning instead of direct git commands
- Implements `ProjectTemplateRepository` and `ProjectTemplate` classes for template management
- Uses `templates.json` manifest file for template discovery
- Supports both pnpm and npm package managers
- Includes comprehensive error handling and user-friendly prompts

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:
- Projects: 1 (CLI tool only)
- Using framework directly? Yes - using existing CLI framework patterns
- Single data model? Yes - simple file operations, no complex data structures
- Avoiding patterns? Yes - direct file operations, no unnecessary abstractions

**Architecture**:
- EVERY feature as library? Yes - CLI command is part of existing CLI package
- Libraries listed: @equinor/fusion-framework-cli (command execution)
- CLI per library: fusion create app --help/--version/--debug
- Library docs: TSDoc comments for all public functions

**Testing (NON-NEGOTIABLE)**:
- RED-GREEN-Refactor cycle enforced? Yes - contract tests must be written first
- Git commits show tests before implementation? Yes - TDD approach
- Order: Contract tests only - focus on CLI behavior contracts
- Real dependencies used? Yes - actual file system operations, real pnpm commands
- Contract tests for: CLI command behavior, argument validation, error handling
- FORBIDDEN: Implementation before contract tests, skipping RED phase

**Observability**:
- Structured logging included? Yes - ConsoleLogger with debug mode
- Frontend logs → backend? N/A - CLI tool
- Error context sufficient? Yes - clear error messages and context

**Versioning**:
- Version number assigned? Yes - follows existing CLI package versioning
- BUILD increments on every change? Yes - changeset workflow
- Breaking changes handled? Yes - documented in changesets

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (actual implementation structure)
```
packages/cli/
├── src/
│   ├── cli/
│   │   └── commands/
│   │       └── create/
│   │           ├── app.ts                    # Main CLI command implementation
│   │           └── _helpers/
│   │               ├── check-target-directory.ts    # Directory validation
│   │               ├── select-template.ts           # Template selection
│   │               ├── setup-repository.ts          # Repository management
│   │               ├── install-dependencies.ts      # Dependency installation
│   │               ├── start-dev-server.ts          # Dev server startup
│   │               ├── open-in-ide.ts               # IDE opening
│   │               └── cleanup-template-files.ts    # Cleanup operations
│   ├── bin/
│   │   └── helpers/
│   │       ├── ProjectTemplateRepository.ts  # Repository management class
│   │       ├── ProjectTemplate.ts            # Template representation class
│   │       ├── project-templates.schema.ts   # Template manifest schema
│   │       └── install-package-dependencies.ts # Package installation
│   ├── lib/
│   │   └── utils/
│   │       └── assert.ts                 # Validation utilities
│   └── __tests__/
│       ├── contract/                   # Contract tests for CLI behavior
│       ├── integration/                # End-to-end CLI tests
│       └── unit/                      # Unit tests for individual functions
├── docs/
│   └── [CLI documentation]
└── dist/                              # Built output
```

### Template Repository Structure
```
equinor/fusion-app-template/
├── templates.json                     # Template manifest file (defines available templates)
├── apps/                              # Template applications
│   ├── bare/                          # Minimal template with basic setup
│   └── basic/                         # Complete template with common features
├── README.md                          # Template repository documentation
├── SECURITY.md                        # Security information
├── doc/                               # Documentation files
├── .github/                           # GitHub workflows and templates
└── .changeset/                        # Changeset configuration
```

**Template Discovery**: Uses `templates.json` manifest file to define available templates and their resources, rather than scanning directories.

**Structure Decision**: Option 1 (Single project) - CLI tool with existing package structure

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh copilot` for your AI assistant
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

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
- Dependency order: Models before services before UI
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 15-20 numbered, ordered tasks in tasks.md (focused on contract tests)

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

**Specific Task Categories for CLI Command**:

1. **Contract Tests** [P]:
   - CLI command argument validation tests
   - Interactive prompt behavior tests
   - Error handling and exit code tests
   - Template discovery and validation tests
   - Command help and version output tests
   - Template selection contract tests

2. **Implementation** (after contract tests pass):
   - CLI command structure and argument parsing
   - Template selection logic
   - File copying and resource management
   - User interaction flow
   - Error handling and cleanup

3. **Documentation and Examples**:
   - Update CLI help documentation
   - Create usage examples
   - Update README with new command
   - Add TSDoc comments for all public functions

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [x] Phase 3: Tasks generated (/tasks command)
- [x] Phase 4: Implementation complete
- [x] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*