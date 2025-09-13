# Data Model: CLI Create App from Templates

## Entities

### ApplicationTemplate
Represents a predefined project template available for app creation.

**Fields**:
- `id: string` - Unique identifier (e.g., "app-react", "app-vanilla")
- `name: string` - Human-readable name (e.g., "React Application")
- `description: string` - Template description
- `source: string` - GitHub repository path (e.g., "equinor/fusion-app-template")
- `path: string` - Template path within repository (e.g., "apps/basic")
- `default: boolean` - Whether this is the default template

**Validation Rules**:
- `id` must be unique across all templates
- `name` and `description` are required
- `source` must be a valid GitHub repository path
- `path` must exist within the source repository

**State Transitions**:
- `available` → `cloning` → `ready` → `used`
- `available` → `error` (if cloning fails)

### ApplicationInstance
Represents a created application instance from a template.

**Fields**:
- `name: string` - Application name (user-provided)
- `path: string` - Local file system path
- `template: ApplicationTemplate` - Source template
- `status: ApplicationStatus` - Current status
- `createdAt: Date` - Creation timestamp
- `options: CreationOptions` - Creation configuration

**Validation Rules**:
- `name` must be valid directory name (no special characters)
- `path` must not exist before creation
- `name` must be unique within parent directory

**State Transitions**:
- `initializing` → `cloning` → `configuring` → `installing` → `ready`
- Any state → `error` (if operation fails)

### CreationOptions
Configuration options for app creation process.

**Fields**:
- `template?: string` - Specific template ID (optional)
- `installDependencies: boolean` - Whether to install dependencies
- `startDevServer: boolean` - Whether to start dev server
- `openInIDE: boolean` - Whether to open in IDE
- `cleanupTempFiles: boolean` - Whether to clean up temporary files
- `skipPrompts: boolean` - Whether to skip interactive prompts
- `debug: boolean` - Whether to enable debug mode

**Validation Rules**:
- `template` must reference valid ApplicationTemplate if provided
- Boolean flags have sensible defaults

## Relationships

- `ApplicationInstance` → `ApplicationTemplate` (many-to-one)
- `ApplicationInstance` → `CreationOptions` (one-to-one)
- `ApplicationTemplate` → `ApplicationInstance` (one-to-many)

## Data Flow

1. **Template Discovery**: Load available templates from configuration
2. **Template Selection**: User selects template (interactive or via flag)
3. **Validation**: Validate app name and target path
4. **Cloning**: Clone template to temporary directory
5. **Configuration**: Update template files with app-specific values
6. **Installation**: Install dependencies (if requested)
7. **Finalization**: Move to final location, initialize git, cleanup

## Constraints

- App names must be valid directory names
- Target paths must not exist
- Templates must be accessible (network or local)
- All operations must be atomic (rollback on failure)
- Temporary files must be cleaned up (user choice)
