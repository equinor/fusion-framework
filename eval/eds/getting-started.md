# Getting Started

These queries test whether the EDS index surfaces onboarding and setup information
— installing packages, wrapping apps with EdsProvider, understanding the package
structure, and integrating EDS with development workflows.

When judging results, verify that:
- Installation instructions use `@equinor/eds-core-react` as the primary component package.
- EdsProvider is mentioned as the required wrapper for EDS components.
- Package names are real published packages, not fabricated.
- Figma and design tool references come from actual doc-site content, not hallucinated.

## How to install and get started with EDS in a React project

- must mention `@equinor/eds-core-react` as the main component package to install
- must mention `@equinor/eds-tokens` for design tokens
- must mention `@equinor/eds-icons` for icon data
- should mention `EdsProvider` as the top-level wrapper
- should show a basic installation command using npm or pnpm

## What is EdsProvider and how to set it up

- must mention `EdsProvider` from `@equinor/eds-core-react`
- must explain that it provides density and theme context to child components
- should show a code example wrapping an app with `EdsProvider`
- should mention density options (comfortable, spacious)

## What packages make up the Equinor Design System

- must mention `@equinor/eds-core-react` for React components
- must mention `@equinor/eds-tokens` for design tokens and CSS variables
- must mention `@equinor/eds-icons` for icon data
- should mention `@equinor/eds-utils` if it exists in the index
- should reference the EDS GitHub repository at `equinor/design-system`

## How to set up EDS in Figma for design work

- must reference Figma-related content from the EDS documentation
- must mention the Figma component library or getting started guide for designers
- should mention team roles (designer vs developer onboarding paths)
- should reference the EDS doc-site for detailed Figma setup instructions

## What is the Equinor Design System and what does it provide

- must describe EDS as a design system for Equinor's digital products
- must mention that it provides React components, design tokens, and icons
- must reference at least one key principle (consistency, accessibility, or Equinor branding)
- should mention both the component library and the documentation site
- should reference the colour foundation as a key feature
