# CLI Command Contract

## Command Signature

```bash
fusion create app <name> [options]
```

## Arguments

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | Yes | Name of the application to create |

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `-t, --template <type>` | string | - | Template type to use (will prompt if not specified or not found) |
| `-d, --directory <path>` | string | "." | Directory to create the app in |
| `--branch <branch>` | string | "main" | Branch to checkout from template repository |
| `--clean` | boolean | false | Clean the repo directory before cloning |
| `--debug` | boolean | false | Enable debug mode for verbose logging |
| `--help` | boolean | false | Display help information |
| `--version` | boolean | false | Display version information |

## Interactive Prompts

### Template Selection
- **Trigger**: When no template specified or template not found
- **Type**: List selection
- **Options**: Available templates from repository
- **Default**: First available template

### Target Directory Handling
- **Trigger**: When target directory exists and is not empty
- **Type**: List selection
- **Options**: Continue, Clean, Abort
- **Default**: Abort

### Dependency Installation
- **Trigger**: After template copying
- **Type**: Confirmation
- **Message**: "📦 Install dependencies?"
- **Default**: true

### Package Manager Selection
- **Trigger**: After dependency installation confirmation
- **Type**: List selection
- **Options**: pnpm, npm
- **Default**: pnpm

### Development Server
- **Trigger**: After dependency installation (if enabled)
- **Type**: Confirmation
- **Message**: "🚀 Start development server?"
- **Default**: true

### IDE Opening
- **Trigger**: After successful creation
- **Type**: List selection
- **Options**: VS Code, Cursor, No
- **Default**: No

### Cleanup
- **Trigger**: After successful creation
- **Type**: Confirmation
- **Message**: "🗑️ Remove temporary template files?"
- **Default**: false

## Exit Codes

| Code | Description |
|------|-------------|
| 0 | Success |
| 1 | General error (invalid arguments, file system errors) |
| 2 | Template not found or inaccessible |
| 3 | Network error (repository cloning failed) |
| 4 | Permission error (cannot write to target directory) |
| 5 | Dependency installation failed |

## Error Messages

### Validation Errors
- `App name is required`
- `Directory '${path}' does not exist, use -d to specify a different directory`
- `Template '${template}' not found. Available templates: ${list}`

### File System Errors
- `Template directory not found: ${path}`
- `No template directories found in: ${path}`
- `Failed to create directory: ${path}`
- `Permission denied: ${path}`

### Network Errors
- `Failed to clone template repository: ${error}`
- `Repository '${repo}' not accessible`
- `Network timeout while cloning repository`

### Dependency Errors
- `pnpm install failed with exit code ${code}`
- `Failed to run pnpm install: ${error}`
- `Dependency installation failed. You can run "pnpm install" manually later.`

## Success Output

### Standard Output
```
✅ Application created successfully!

Next steps:
  cd my-app
  pnpm install
  pnpm dev
```

### Debug Output
- Template root path
- Available templates list
- Selected template
- Resource copying details
- Dependency installation progress
- Cleanup operations

## Examples

### Basic Usage
```bash
fusion create app my-new-app
```

### With Template
```bash
fusion create app my-react-app --template app-react
```

### In Specific Directory
```bash
fusion create app my-app --directory /path/to/projects
```

### Debug Mode
```bash
fusion create app my-app --debug
```

### With Clean Flag
```bash
fusion create app my-app --clean
```

### With Branch Selection
```bash
fusion create app my-app --branch develop
```

### Help
```bash
fusion create app --help
```

## Dependencies

### Required
- Node.js 22+
- pnpm (for dependency installation)
- git (for repository cloning)

### Optional
- IDE (for project opening)
- GitHub CLI (for enhanced repository access)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `FUSION_TEMPLATE_REPO` | Template repository URL | `equinor/fusion-app-template` |
| `FUSION_TEMPLATE_BRANCH` | Template repository branch | `main` |
| `FUSION_DEBUG` | Enable debug mode | `false` |
