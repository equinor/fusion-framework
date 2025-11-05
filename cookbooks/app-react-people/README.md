# People Service Cookbook

This cookbook demonstrates how to use components from the \`@equinor/fusion-react-person\` package to interact with the Fusion People service.

## Overview

The purpose of this cookbook is to showcase the usage of person components in a Fusion Framework application. Person components will request resolve by default, but can also be used by providing the \`dataSource\` directly.

## Features

- ✅ **Person Components**: Display person information in your UI
- ✅ **Auto-Resolution**: Automatically resolve person data from the People service
- ✅ **Manual Data Source**: Optionally provide person data directly
- ✅ **Person Provider**: Global person context for your app

## What This Shows

This cookbook demonstrates how to:
- Display person information using person components
- Fetch person data automatically from the People service
- Provide person data manually when needed
- Use the PersonProvider for global context

## Usage Examples

### Person Provider

All applications should have access to the PersonProvider component. It provides global person context to your app.

### Auto-Resolution

By default, person components will request and resolve data from the Fusion People service:

\`\`\`typescript
import { PersonCard } from '@equinor/fusion-react-person';

// Component will automatically fetch person data by Azure AD ID
<PersonCard azureId="user@example.com" />
\`\`\`

### Manual Data Source

You can also provide the person data directly:

\`\`\`typescript
const personData = {
  azureId: 'user@example.com',
  name: 'John Doe',
  jobTitle: 'Software Engineer',
  department: 'IT',
};

<PersonCard dataSource={personData} />
\`\`\`

## Available Components

This cookbook demonstrates various person-related components:
- **PersonCard**: Display person information in a card format
- **PersonProvider**: Global context provider for person data
- **PersonList**: Display a list of people
- And more...

## Service Endpoints

The cookbook provides examples of how to consume endpoints from the Fusion People service to display user information.

## Related Documentation

See the [guide for getting started](../README.md#getting-started) for general cookbook setup instructions.
