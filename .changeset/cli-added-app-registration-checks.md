---
"@equinor/fusion-framework-cli": minor
---

Enhanced app management commands with pre-flight registration checks.

- Modified `checkApp` function to return boolean values instead of log results for better programmatic usage
- Added handling for HTTP 410 status (deleted apps) in app registration checks
- Added pre-flight app registration validation to `publish` and `upload` commands
- Commands now exit early if the app is not registered or has been deleted from the app store
- Improved error handling and user feedback for app registration status

This prevents publishing/uploading apps that are not registered in the app store, improving reliability and user experience.

Thanks to @odinr for reporting this issue.

Closes #3397
