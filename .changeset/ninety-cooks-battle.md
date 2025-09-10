---
"@equinor/fusion-framework-cli": patch
---

**Portal Upload and Publish Improvements**

- **Enhanced portal upload functionality**: Added proper return type `Promise<{ name: string; version: string }>` to `uploadPortalBundle` function to return upload metadata
- **Improved error handling**: Added better response parsing and error handling for portal service responses
- **Bundle argument support**: Added support for specifying a bundle file path as an argument in the `portal publish` command
- **Better variable naming**: Renamed `appClient` to `portalClient` for clearer service identification
- **Enhanced publish workflow**: Updated publish command to use upload results for tagging instead of relying on bundle manifest, improving reliability when uploading pre-built bundles
- **Type safety improvements**: Added proper TypeScript types and imports for `AdmZip` in publish command

These changes improve the reliability and usability of the portal publishing workflow, especially when working with pre-built
