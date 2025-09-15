# Data Model: CLI Command to Create Apps from Templates

## Entities

### ProjectTemplate (Application Template)
**Purpose**: Represents a predefined project structure for creating Fusion Framework applications

**Fields**:
- `name: string` - Template identifier (e.g., "app-react", "app-vanilla")
- `description: string` - Human-readable description of template purpose
- `resources: TemplateResource[]` - Additional files to copy (README, docs, .github)
- `source: string` - Base directory path in template repository
- `logger?: ConsoleLogger` - Optional logger instance

**Methods**:
- `copyTo(targetDir: string): void` - Copy template resources to target directory

**Validation Rules**:
- Name must be valid filesystem identifier (alphanumeric, hyphens, underscores)
- Source path must exist and be accessible
- Description must be non-empty string
- Resources must be valid file/directory paths

**State Transitions**:
- `discovered` → `selected` → `copied` → `configured`

### Application Instance
**Purpose**: Represents a created application directory ready for development

**Fields**:
- `name: string` - Application name (user-specified)
- `path: string` - Target directory path
- `template: ApplicationTemplate` - Source template used
- `dependenciesInstalled: boolean` - Whether pnpm install was run
- `gitInitialized: boolean` - Whether git repository was initialized
- `createdAt: Date` - Creation timestamp

**Validation Rules**:
- Name must be valid filesystem identifier
- Path must not already exist (unless overwrite specified)
- Template must be valid and accessible

**State Transitions**:
- `created` → `dependenciesInstalled` → `gitInitialized` → `ready`

### ProjectTemplateRepository
**Purpose**: Manages template repository cloning and template discovery

**Fields**:
- `#initialized: boolean` - Whether repository has been initialized
- `#git: SimpleGit` - Git client instance
- `#baseDir: string` - Local directory path for cloned repository
- `#log?: ConsoleLogger` - Optional logger instance
- `#protocol: GitClientProtocol` - Git protocol (https/ssh)
- `#branch: string` - Branch to checkout

**Methods**:
- `initialize(): Promise<void>` - Clone and initialize repository
- `getAvailableTemplates(): Promise<ProjectTemplate[]>` - Discover available templates
- `cleanup(): Promise<boolean>` - Remove repository directory

### TemplateResource
**Purpose**: Represents additional files to copy from template repository

**Fields**:
- `path: string` - Source file path in template repository
- `target?: string` - Optional target path in application directory
- `recursive: boolean` - Whether to copy directory recursively

**Validation Rules**:
- Source path must exist
- Target path must be valid filesystem path
- Recursive flag only applies to directories

### Command Options
**Purpose**: Represents user-specified command-line options

**Fields**:
- `appName: string` - Required application name
- `template?: string` - Optional template specification
- `directory: string` - Target directory (default: ".")
- `branch: string` - Branch to checkout (default: "main")
- `clean: boolean` - Clean repo directory before cloning
- `debug: boolean` - Enable debug logging

**Validation Rules**:
- App name is required and must be valid identifier
- Directory must exist and be writable
- Template must be valid if specified

### User Preferences
**Purpose**: Represents user choices during interactive prompts

**Fields**:
- `selectedTemplate: string` - Chosen template name
- `installDependencies: boolean` - Whether to run package manager install
- `packageManager: string` - Selected package manager (pnpm/npm)
- `startDevServer: boolean` - Whether to start development server
- `openInIDE: string | false` - IDE to open (code/cursor/false)
- `cleanupTempFiles: boolean` - Whether to remove temporary files

**Validation Rules**:
- All fields have sensible defaults
- User can override any default value
- Choices must be valid for current context

## Relationships

### Template → Instance
- One-to-many: One template can create many application instances
- Template provides structure, instance adds user-specific configuration

### Instance → Resources
- One-to-many: One instance can have multiple resources copied
- Resources provide additional project files beyond core template

### Options → Preferences
- One-to-one: Command options influence default preferences
- User can override any option through interactive prompts

## Data Flow

1. **Repository Setup**: Clone template repository using simple-git
2. **Template Discovery**: Parse templates.json manifest for available templates
3. **Target Directory Check**: Validate target directory and handle conflicts
4. **Template Selection**: User chooses template (interactive or via --template flag)
5. **Instance Creation**: Create application directory with template structure
6. **Resource Copying**: Copy template resources using ProjectTemplate.copyTo()
7. **Dependency Installation**: Run package manager install if requested
8. **Development Server**: Start dev server if requested
9. **IDE Opening**: Open project in selected IDE if requested
10. **Cleanup**: Remove temporary template files if requested

## Validation Rules

### App Name Validation
- Must be valid filesystem identifier
- Cannot contain special characters except hyphens and underscores
- Must not conflict with existing directory (unless overwrite specified)
- Must not be empty or whitespace-only

### Template Validation
- Must exist in template repository
- Must be accessible (readable directory)
- Must contain required template files
- Must have valid template structure

### Path Validation
- Target directory must exist and be writable
- Source paths must exist and be readable
- All paths must be absolute or properly resolved
- No path traversal attacks allowed

### User Input Validation
- All interactive prompts must have valid options
- User input must be validated before processing
- Clear error messages for invalid input
- Graceful handling of cancellation (Ctrl+C)
