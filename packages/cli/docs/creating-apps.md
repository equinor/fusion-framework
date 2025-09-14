# 🚀 Create Amazing Apps in Seconds!

Ready to build something awesome? The Fusion Framework CLI makes it ridiculously easy to create production-ready applications with just one command!

## ⚡ Get Started in 30 Seconds

```bash
# Create your app (we'll guide you through everything!)
ffc create app my-awesome-app

# Or pick a template right away
ffc create app my-awesome-app --template basic
```
That's it! We'll handle the rest and have you coding in no time. 🎉


> [!NOTE]
> You can also get started by using the [GitHub template](https://github.com/new?owner=equinor&template_name=fusion-app-template&template_owner=equinor) or see the [source code](https://github.com/equinor/fusion-app-template) directly.


## 🎉 What You Get

Your new app will have everything you need to build the next big thing:

- **👍🏻 One command** - `fusion create app` and you're off!
- **🎯 Guided setup** - We walk you through every step
- **🚀 Production-ready** - Templates that actually work in the real world
- **🧠 Smart features** - Context management, navigation, and more built-in
- **💪 TypeScript power** - Full type safety from day one
- **🐛 Debug when needed** - Tools to help when things get tricky

**What are you waiting for? Let's create something awesome! 🚀**

## Command Reference

### Basic Usage

```bash
ffc create app <name> [options]
# or
fusion-framework-cli create app <name> [options]
```

**Arguments:**
- `<name>` - Name of the application to create (required)

**Options:**
- `-t, --template <type>` - Template type to use (will prompt if not specified)
- `-d, --directory <path>` - Directory to create the app in (default: ".")
- `--branch <branch>` - Git branch to checkout (default: "main")
- `--clean` - Clean the repository directory before cloning
- `--debug` - Enable debug mode for verbose logging
- `-h, --help` - Display help information

## Examples

### Create a Basic App

```bash
# Create an app in the current directory
ffc create app my-awesome-app

# Create an app in a specific directory
ffc create app my-awesome-app --directory ./projects
```

### Create with Specific Template

```bash
# Create a basic template app
ffc create app my-basic-app --template basic

# Create a bare template app
ffc create app my-bare-app --template bare
```

### Advanced Usage

```bash
# Create with debug logging and clean setup
ffc create app my-app --debug --clean

# Create in a specific directory with custom branch
ffc create app my-app --directory ./apps --branch develop

# Create with template selection and debug
ffc create app my-app --template basic --debug
```

## What Happens When You Create an App

We'll walk you through everything step by step:

1. **✅ Check your app name** - Make sure everything looks good
2. **📁 Find the perfect spot** - We'll create your app in the right place
3. **🤔 Handle any conflicts** - If something's already there, we'll ask what to do
4. **📥 Grab the latest templates** - Download the best templates from our repo
5. **🎨 Pick your style** - Choose between basic (full-featured) or bare (minimal)
6. **💾 Copy everything over** - Set up your project structure
7. **🧹 Clean up** - Remove temporary files (your choice)
8. **💻 Open in your IDE** - We'll launch your favorite editor
9. **📦 Install dependencies** - Get all the packages you need
10. **🌈 Start coding!** - Fire up the dev server and you're ready to go

No stress, no confusion - just smooth sailing!

## Choose Your Template

Pick the perfect starting point for your project:

### Basic Template
**Perfect for most projects!** 
- Full React app with everything you need
- Context management & navigation built-in
- EDS components ready to go
- TypeScript from day one

### Bare Template  
**Minimal and clean!**
- Just the essentials
- Perfect for learning or custom builds
- Lightweight and fast

Both templates are production-ready and come with all the Fusion Framework magic! ✨



## Troubleshooting

### Common Issues

**Directory Already Exists**
```bash
# Use --clean to remove existing directory
ffc create app my-app --clean

# Or specify a different directory
ffc create app my-app --directory ./new-location
```

**Template Not Found**
```bash
# List available templates
ffc create app my-app --help

# Use interactive selection
ffc create app my-app
```

**Permission Issues**
```bash
# Ensure you have write permissions to the target directory
chmod 755 ./target-directory
```

### Debug Mode

Enable debug mode for detailed logging:

```bash
ffc create app my-app --debug
```

This will show:
- Target directory resolution details
- Repository cloning and setup operations
- Template selection and copying process
- Dependency installation progress
- Development server startup details

## Best Practices

### Naming Conventions

- Use kebab-case for app names: `my-awesome-app`
- Avoid spaces and special characters
- Keep names descriptive but concise

### Directory Organization

```bash
# Organize apps in a dedicated directory
mkdir ~/fusion-apps
cd ~/fusion-apps
ffc create app my-app
```

### Template Selection

- Choose templates based on your specific needs
- Start with basic templates and add features incrementally
- Use `--template` flag for automated workflows

### Version Control

```bash
# Initialize git repository after creation
cd my-new-app
git init
git add .
git commit -m "Initial commit"
```

## Integration with Development Workflow

### IDE Integration

The CLI automatically detects and opens your project in supported IDEs:

- **Automatic Detection** - Detects common IDEs and opens the project automatically
- **Manual Opening** - Provides instructions for IDEs that aren't automatically detected
- **Step 9** - IDE integration happens after template copying and before dependency installation

### Development Server

After creation, you can start the development server. See the [Development Server guide](./application.md#start-the-development-server) for detailed information.

### Building for Production

See the [Build guide](./application.md#build) for detailed information about building your application.

## Advanced Configuration

### App Configuration

See the [Configuration guide](./application.md#configuration) for detailed information about configuring your application.

### Custom Templates

You can create custom templates by:

1. Forking the [fusion-app-template](https://github.com/equinor/fusion-app-template) repository
2. Modifying the template structure
3. Using your custom template with the CLI

### Environment-Specific Configuration

```bash
# Create app with specific environment
ffc create app my-app --template basic --directory ./apps/prod
```

## Getting Help

### Command Help

```bash
# General help
ffc --help
# or
fusion-framework-cli --help

# Create command help
ffc create --help
# or
fusion-framework-cli create --help

# Specific create app help
ffc create app --help
# or
fusion-framework-cli create app --help
```

### Additional Resources

- [Fusion Framework Documentation](https://github.com/equinor/fusion-framework)
- [Template Repository](https://github.com/equinor/fusion-app-template)
- [GitHub Template](https://github.com/new?owner=equinor&template_name=fusion-app-template&template_owner=equinor) - Create from template directly
- [CLI Issues](https://github.com/equinor/fusion-framework/issues)

## Ready to Build Something Amazing?

Your new app will have context management, navigation, API integration, and EDS components - everything you need to build the next big thing! 

**What are you waiting for? Let's create something awesome! 🚀**
