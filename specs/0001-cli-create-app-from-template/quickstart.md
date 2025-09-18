# Quickstart: Create Fusion Framework App

## Prerequisites

- Node.js 20 or higher
- pnpm package manager
- Git (for template cloning)
- Terminal/Command prompt access

## Installation

Install the Fusion Framework CLI globally:

```bash
npm install -g @equinor/fusion-framework-cli
```

Or use npx (no installation required):

```bash
npx @equinor/fusion-framework-cli create app my-app
```

## Basic Usage

### 1. Create a New App

```bash
ffc create app my-new-app
```

This command will:
- Clone the latest templates from the fusion-app-template repository
- Show you available templates to choose from
- Copy the selected template to your new app directory
- Ask if you want to install dependencies
- Provide next steps for development

### 2. Choose a Specific Template

```bash
ffc create app my-react-app --template basic
```

Available templates:
- `bare`: Minimal template with basic setup
- `basic`: Complete template with common features

### 3. Create in Custom Directory

```bash
ffc create app my-app --directory /path/to/projects
```

### 4. Create with Debug Logging

```bash
ffc create app my-app --debug
```

This provides verbose output:
- Template repository cloning progress
- File copying operations
- Dependency installation output
- Detailed error messages

## Development Workflow

### After Creating Your App

1. **Navigate to your app directory**:
   ```bash
   cd my-new-app
   ```

2. **Install dependencies** (if not done during creation):
   ```bash
   pnpm install
   ```

3. **Start development server**:
   ```bash
   pnpm dev
   ```

4. **Open in your IDE** (optional):
   ```bash
   code .  # VS Code
   # or
   idea .  # IntelliJ IDEA
   ```

### Available Scripts

Your created app will have these scripts in `package.json`:

```json
{
  "scripts": {
    "dev": "Start development server",
    "build": "Build for production",
    "test": "Run tests",
    "lint": "Run linter",
    "type-check": "Run TypeScript type checking"
  }
}
```

## Command Options

| Option | Description | Default |
|--------|-------------|---------|
| `-t, --template <type>` | Template type to use | Interactive selection |
| `-d, --directory <path>` | Directory to create app in | Current directory |
| `--branch <branch>` | Git branch to checkout | main |
| `--clean` | Clean repository directory before cloning | false |
| `--debug` | Enable debug logging | false |
| `--help` | Show help information | false |

## Troubleshooting

### Common Issues

**Template not found**:
```bash
# Check available templates
ffc create app my-app --template invalid-template
# Will show available templates
```

**Permission denied**:
```bash
# Ensure you have write permissions to the target directory
chmod 755 /path/to/directory
```

**Network issues**:
```bash
# Check internet connection and try again
ffc create app my-app --debug
```

**Dependencies installation failed**:
```bash
# Install manually after creation
cd my-app
pnpm install
```

### Debug Mode

Use `--debug` flag for detailed logging:

```bash
ffc create app my-app --debug
```

This will show:
- Template repository cloning progress
- File copying operations
- Dependency installation output
- Detailed error messages

## Examples

### Create a Basic App
```bash
ffc create app my-basic-app --template basic --directory ~/projects
```

### Create with Debug Info
```bash
ffc create app my-app --debug --template basic
```

### Create in Specific Directory
```bash
ffc create app my-app --directory ./apps --clean
```

## Next Steps

After creating your app:

1. **Explore the codebase** - Check the generated files and structure
2. **Read the README** - Look for template-specific documentation
3. **Configure your app** - Update app configuration as needed
4. **Start coding** - Begin implementing your application features
5. **Deploy** - Use `fusion app publish` when ready to deploy

## Getting Help

- **Command help**: `ffc create app --help`
- **General help**: `ffc --help`
- **Documentation**: Check the generated `TEMPLATE.md` in your app directory
- **Issues**: Report problems on the GitHub repository

## Advanced Usage

### Custom Template Directory

If you want to use a local template directory:

```bash
# Set environment variable
export FUSION_TEMPLATE_DIR=/path/to/templates
ffc create app my-app
```

### Batch Creation

Create multiple apps with different templates:

```bash
ffc create app app1 --template bare
ffc create app app2 --template basic
```

### Integration with CI/CD

For automated app creation in CI/CD pipelines:

```bash
ffc create app my-app --template basic
cd my-app
pnpm install
pnpm build
```
