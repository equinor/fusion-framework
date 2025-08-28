This CLI enables secure authentication and persistent token caching by storing credentials in your system's keychain. It uses [`@azure/msal-node`](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-node) for authentication, which relies on the [`keytar`](https://github.com/atom/node-keytar) module for secure credential storage.

> **What is `libsecret`?**  
> [`libsecret`](https://wiki.gnome.org/Projects/Libsecret) is a library for storing and retrieving passwords and secrets. On Linux, `keytar` depends on `libsecret` to access the system keyring.

## Platform Requirements

- **Windows:** No additional dependencies. `keytar` uses the Windows Credential Manager.
- **macOS:** No additional dependencies. `keytar` uses the macOS Keychain. If you encounter unusual issues (rare), you can optionally try installing `libsecret`:
  ```bash
  brew install libsecret
  ```
- **Linux:** You must install `libsecret` for secure credential storage. See below for instructions.

## Linux Installation
Install the `libsecret` library based on your distribution:

- **Ubuntu/Debian**:
  ```bash
  sudo apt-get update
  sudo apt-get install -y libsecret-1-0 libsecret-1-dev
  ```
  > Both runtime and development packages are required for building native modules.
- **Fedora**:
  ```bash
  sudo dnf install -y libsecret libsecret-devel
  ```
  > Install both runtime and development packages if you plan to build native modules.
- **Arch Linux**:
  ```bash
  sudo pacman -S --noconfirm libsecret
  ```

## Verifying Installation
After installing `libsecret`, rebuild `keytar` to ensure it links correctly:

```bash
npm rebuild keytar
```

You can verify that `keytar` is working by running your CLI and checking for credential storage warnings. Alternatively, you can test with a simple script:

```js
const keytar = require('keytar');
keytar.setPassword('test-service', 'test-account', 'test-password')
  .then(() => keytar.getPassword('test-service', 'test-account'))
  .then(console.log)
  .catch(console.error);
```
If you see errors related to `keytar` or `libsecret`, see troubleshooting below.

## Troubleshooting
- **Missing `libsecret` errors:** Ensure you have installed both the runtime and development packages (e.g., `libsecret-1-0` and `libsecret-1-dev` on Ubuntu/Debian).
- **Rebuild keytar:**
  ```bash
  npm rebuild keytar
  ```
- **Still having issues?**
  - Ensure your system keyring (e.g., GNOME Keyring or KWallet) is running and unlocked. On some headless or minimal Linux environments, you may need to start or configure the keyring daemon manually.
  - See the [`keytar` troubleshooting guide](https://github.com/atom/node-keytar#troubleshooting).
  - Consult your distribution's documentation for keyring setup.

## Resources
- [`keytar` documentation](https://github.com/atom/node-keytar)
- [`libsecret` project page](https://wiki.gnome.org/Projects/Libsecret)
- [@azure/msal-node](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-node)