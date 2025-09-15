---
"@equinor/fusion-framework-cli": patch
---

Enhanced CLI security with path validation and improved error handling for create command.

## New Features

- **Path Security Validation**: Added `validateSafePath()` function to prevent path traversal attacks
- **Safe Directory Operations**: Added `safeRmSync()` function for secure directory removal
- **Enhanced Error Messages**: Improved user-friendly error messages with visual indicators

## Security Improvements

- **Path Traversal Protection**: Prevents users from specifying paths outside the current working directory
- **Input Validation**: Validates target paths before performing file system operations
- **Safe Cleanup**: Directory removal operations now validate paths before execution

## User Experience

- **Better Error Messages**: Clear, actionable error messages with ❌ and 💡 indicators
- **Helpful Guidance**: Users get specific suggestions when path validation fails
- **Clean Error Handling**: No more messy stack traces for path-related errors

## Technical Details

- Uses `is-path-inside` library for robust path validation
- Integrates path security into `checkTargetDirectory` helper
- Maintains backward compatibility with existing functionality
- Added comprehensive JSDoc documentation for all new functions
