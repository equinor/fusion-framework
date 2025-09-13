# Quickstart: CLI Create App from Templates

## Prerequisites

- Node.js 18+ installed
- Git installed
- GitHub CLI (`gh`) installed (recommended) or Git configured
- pnpm package manager

## Installation

```bash
# Install Fusion Framework CLI globally
npm install -g @equinor/fusion-framework-cli

# Or use npx (no installation required)
npx @equinor/fusion-framework-cli create app my-app
```

## Basic Usage

### Create a new app with default template
```bash
fusion create app my-new-app
```

### Create with specific template
```bash
fusion create app my-react-app --template app-react
```

### Skip interactive prompts
```bash
fusion create app my-app --default
```

### Enable debug mode
```bash
fusion create app my-app --debug
```

## Interactive Workflow

1. **Run the command**:
   ```bash
   fusion create app my-app
   ```

2. **Select template** (if not specified):
   ```
   ? Select a template:
   ❯ React Application (app-react)
     Vanilla JavaScript (app-vanilla)
     Vue Application (app-vue)
   ```

3. **Configure options**:
   ```
   ? Install dependencies? (Y/n) Yes
   ? Start development server? (y/N) No
   ? Open in IDE? (y/N) No
   ? Clean up temporary files? (y/N) No
   ```

4. **Wait for completion**:
   ```
   ✓ Cloning template...
   ✓ Configuring application...
   ✓ Installing dependencies...
   ✓ Initializing git repository...
   ✓ Application created successfully!
   ```

## Available Templates

| Template ID | Name | Description |
|-------------|------|-------------|
| `app-react` | React Application | Full-featured React app with routing |
| `app-vanilla` | Vanilla JavaScript | Simple JavaScript application |
| `app-vue` | Vue Application | Vue.js application with composition API |

## Command Options

| Option | Description | Default |
|--------|-------------|---------|
| `--template <id>` | Specify template ID | Interactive selection |
| `--default` | Use default options, skip prompts | Interactive prompts |
| `--debug` | Enable debug output | `false` |
| `--help` | Show help information | - |

## Troubleshooting

### Template cloning fails
```bash
# Check GitHub CLI authentication
gh auth status

# Or configure Git credentials
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Permission errors
```bash
# Ensure you have write permissions to the target directory
ls -la /path/to/target/directory
```

### Network issues
```bash
# Check internet connection
ping github.com

# Try with debug mode for more details
fusion create app my-app --debug
```

## Examples

### Create a React app and start development
```bash
fusion create app my-react-app --template app-react
cd my-react-app
pnpm dev
```

### Create with all options enabled
```bash
fusion create app my-app --template app-react --default
# This will install dependencies, start dev server, and open in IDE
```

### Create in specific directory
```bash
cd /path/to/projects
fusion create app my-app
```

## Next Steps

After creating your app:

1. **Navigate to the app directory**:
   ```bash
   cd my-app
   ```

2. **Install dependencies** (if not done automatically):
   ```bash
   pnpm install
   ```

3. **Start development server**:
   ```bash
   pnpm dev
   ```

4. **Open in your IDE**:
   ```bash
   code .  # VS Code
   # or
   cursor .  # Cursor
   ```

## Getting Help

- **Command help**: `fusion create app --help`
- **General help**: `fusion --help`
- **Debug mode**: Add `--debug` to any command
- **GitHub Issues**: [Report issues](https://github.com/equinor/fusion-framework/issues)
