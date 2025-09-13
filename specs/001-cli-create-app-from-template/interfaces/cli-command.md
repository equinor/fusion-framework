# CLI Command Interface Specification

## Command Structure

```bash
fusion create app <app-name> [options]
```

## Arguments

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `app-name` | string | Yes | Name of the application to create |

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--template <id>` | string | Interactive | Template ID to use |
| `--default` | boolean | false | Use default options, skip prompts |
| `--debug` | boolean | false | Enable debug output |
| `--help` | boolean | false | Show help information |
| `--version` | boolean | false | Show version information |

## Global Options

| Option | Type | Description |
|--------|------|-------------|
| `--help` | boolean | Show help information |
| `--version` | boolean | Show version information |

## Command Examples

### Basic Usage
```bash
# Create app with interactive template selection
fusion create app my-app

# Create app with specific template
fusion create app my-react-app --template app-react

# Create app with default options
fusion create app my-app --default

# Create app with debug output
fusion create app my-app --debug
```

### Help Commands
```bash
# Show general help
fusion --help

# Show create command help
fusion create --help

# Show create app command help
fusion create app --help
```

## Interactive Prompts

When `--default` is not specified, the command will prompt for:

1. **Template Selection** (if `--template` not provided):
   ```
   ? Select a template:
   ❯ React Application (app-react)
     Vanilla JavaScript (app-vanilla)
     Vue Application (app-vue)
   ```

2. **Dependency Installation**:
   ```
   ? Install dependencies? (Y/n)
   ```

3. **Development Server**:
   ```
   ? Start development server? (y/N)
   ```

4. **IDE Opening**:
   ```
   ? Open in IDE? (y/N)
   ```

5. **Cleanup Confirmation**:
   ```
   ? Clean up temporary files? (y/N)
   ```

## Exit Codes

| Code | Description |
|------|-------------|
| 0 | Success |
| 1 | General error |
| 2 | Validation error |
| 3 | Network error |
| 4 | File system error |
| 5 | Template error |
| 6 | Permission error |

## Error Messages

### Validation Errors
```
Error: Invalid app name 'my app'. App names can only contain letters, numbers, hyphens, and underscores.
Error: Directory 'my-app' already exists. Please choose a different name or remove the existing directory.
```

### Network Errors
```
Error: Failed to clone template. Please check your internet connection and GitHub access.
Error: Template 'invalid-template' not found. Available templates: app-react, app-vanilla, app-vue
```

### File System Errors
```
Error: Permission denied. Please ensure you have write access to the current directory.
Error: Failed to create directory. Please check available disk space.
```

## Output Format

### Success Output
```
✓ Cloning template 'app-react'...
✓ Configuring application 'my-app'...
✓ Installing dependencies...
✓ Initializing git repository...
✓ Application created successfully!

Path: /path/to/my-app
Template: app-react
Next steps:
  cd my-app
  pnpm dev
```

### Debug Output
```
[DEBUG] Starting app creation process
[DEBUG] App name: my-app
[DEBUG] Template: app-react
[DEBUG] Target path: /path/to/my-app
[DEBUG] Cloning from: https://github.com/equinor/fusion-app-template
[DEBUG] Template path: templates/app-react
[DEBUG] Cloning completed in 2.3s
[DEBUG] Configuring application...
[DEBUG] Installing dependencies...
[DEBUG] Process completed successfully
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `FUSION_TEMPLATE_REPO` | Template repository URL | `equinor/fusion-app-template` |
| `FUSION_DEFAULT_TEMPLATE` | Default template ID | `app-react` |
| `FUSION_DEBUG` | Enable debug mode | `false` |
