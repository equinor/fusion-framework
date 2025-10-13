# Developing Cookbooks

## Overview

Cookbooks are example applications that demonstrate how to use the Fusion Framework and its various modules in real-world scenarios. They serve as:

- **Learning resources** for developers new to the framework
- **Reference implementations** for common use cases
- **Integration tests** for framework components
- **Starting templates** for new projects

> **Important**: Cookbooks should **only** contain the necessary code for illustrating a specific scenario. Code should follow the [KISS principle](https://en.wikipedia.org/wiki/KISS_principle) with clear, helpful comments.

## Getting Started

See [development documentation](./development.md) for initial repository setup and prerequisites.

### Available Cookbooks

The repository contains cookbooks demonstrating various framework features:

#### React Application Cookbooks
- `app-react` - Basic React application setup
- `app-react-ag-grid` - Using AG Grid with Fusion Framework
- `app-react-apploader` - Application loading patterns
- `app-react-assets` - Asset management and loading
- `app-react-bookmark` - Bookmark functionality
- `app-react-bookmark-advanced` - Advanced bookmark features with routing
- `app-react-charts` - Chart components and data visualization
- `app-react-context` - Context usage patterns
- `app-react-context-custom-error` - Custom error handling in contexts
- `app-react-environment-variables` - Environment variable configuration
- `app-react-feature-flag` - Feature flag implementation
- `app-react-module` - Custom module development
- `app-react-msal` - Microsoft Authentication Library integration
- `app-react-people` - People service integration with person components
- `app-react-router` - Routing and navigation
- `app-react-settings` - Application settings management

#### Other Cookbooks
- `app-vanilla` - Vanilla JavaScript implementation
- `poc-portal` - Proof of concept portal application
- `portal` - Portal framework demonstration

### Running an Existing Cookbook

```bash
# Navigate to the cookbook directory
cd cookbooks/app-react

# Install dependencies (if needed)
pnpm install

# Start development server
pnpm dev
```

Most cookbooks run on `http://localhost:3000` by default. Check the terminal output for the exact URL.

### Testing Cookbooks

Cookbooks serve as integration tests for framework components by demonstrating that various features work together correctly. While most cookbooks don't have formal test suites, they validate that:

- Framework modules integrate properly
- Configuration patterns work as expected
- Components render without errors
- Real-world usage scenarios are supported

Some cookbooks may include example test files or validation logic within their source code.

## Creating a New Cookbook

### Using a Template

Start with an existing cookbook as a template:

```bash
# Copy an existing cookbook (replace 'app-react' with your chosen template)
cp -r cookbooks/app-react cookbooks/your-new-cookbook

# Remove generated files
rm cookbooks/your-new-cookbook/CHANGELOG.md
```

### Configuration Steps

After copying, update the following files:

**`package.json`**:
- Change the `name` field to `@equinor/fusion-framework-cookbook-your-new-cookbook`
- Reset `version` to `"0.0.0"`

**`src/index.ts`** (if applicable):
- Update any app-specific identifiers

### Cookbook Structure

A typical cookbook follows this structure:

```
cookbooks/your-cookbook/
├── src/
│   ├── index.ts          # Application entry point
│   ├── App.tsx           # Main React component (for React cookbooks)
│   ├── config.ts         # Framework configuration
│   └── ...               # Feature-specific files
├── package.json          # Package configuration
├── tsconfig.json         # TypeScript configuration
├── README.md             # Cookbook documentation
└── app.config.ts         # App manifest (optional)
```

## Managing Dependencies

### Adding Internal Dependencies

When adding dependencies to packages within the monorepo:

1. **Update `package.json`** with the new dependency
2. **Update `tsconfig.json`** to include project references:

```json
{
  "references": [
    { "path": "../../packages/react/app" },
    { "path": "../../packages/modules/http" },
    { "path": "../../packages/cli" }
  ]
}
```

### External Dependencies

For third-party dependencies:

```bash
# Add to the cookbook's package.json
cd cookbooks/your-cookbook
pnpm add package-name

# Or for dev dependencies
pnpm add -D package-name
```

> **Note**: The CLI might not immediately register changes in dependencies, so it's good practice to rebuild all packages when making dependency changes:
> ```bash
> pnpm build
> ```

## Best Practices

### Code Quality
- **Keep it simple**: Focus on demonstrating one concept clearly
- **Add comments**: Explain complex setup or configuration
- **Follow conventions**: Use the same patterns as other cookbooks
- **Test thoroughly**: Ensure the cookbook works as expected

### Documentation
- **README**: Include a clear description of what the cookbook demonstrates
- **Code comments**: Explain framework-specific patterns
- **Configuration**: Document any special setup requirements

### Maintenance
- **Keep updated**: Update cookbooks when framework APIs change
- **Version compatibility**: Ensure cookbooks work with current framework versions
- **Remove outdated**: Archive cookbooks that are no longer relevant

## Contributing

When contributing new cookbooks or updating existing ones:

1. Follow the naming convention: `app-react-feature-name`
2. Include comprehensive README documentation
3. Add appropriate tests if the cookbook demonstrates testable functionality
4. Ensure the cookbook builds and runs without errors
5. Create a changeset if the cookbook introduces new dependencies or patterns

See [contributing guidelines](../CONTRIBUTING.md) for detailed contribution processes.