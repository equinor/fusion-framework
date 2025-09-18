This CLI enables secure authentication and persistent token caching by storing credentials in your system's keychain. It uses [`@azure/msal-node`](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-node) for authentication, which relies on the [`keytar`](https://github.com/atom/node-keytar) module for secure credential storage.

> **What is `libsecret`?**
> [`libsecret`](https://wiki.gnome.org/Projects/Libsecret) is a library for storing and retrieving passwords and secrets. On Linux, `keytar` depends on `libsecret` to access the system keyring.

> **Common Issue: `Cannot find module '../build/Release/keytar.node'`**
> This error occurs when the `keytar` native module isn't properly built or installed. It can happen on any platform (Windows, macOS, Linux) and usually indicates missing build tools or failed native compilation.

## Platform Requirements

- **Windows:** No additional dependencies. `keytar` uses the Windows Credential Manager.
- **macOS:** No additional dependencies. `keytar` uses the macOS Keychain. If you encounter unusual issues (rare), you can optionally try installing `libsecret`:
  ```bash
  brew install libsecret
  ```
- **Linux:** You must install `libsecret` for secure credential storage. See below for instructions.

> [!CAUTION]
> "Linux is supported for cache persistence, but not yet for native brokering."
> https://github.com/AzureAD/microsoft-authentication-library-for-js/issues/8035

## Windows Installation

While Windows doesn't require `libsecret`, you may encounter `keytar` native module issues. Ensure you have the necessary build tools:

### Prerequisites
- **Visual Studio Build Tools** or **Visual Studio Community** with C++ workload
- **Python** (for node-gyp)
- **Node.js** with npm/yarn

### Installation Steps
1. Install Visual Studio Build Tools:
   - Download from [Microsoft Visual Studio](https://visualstudio.microsoft.com/downloads/)
   - Select "C++ build tools" workload
   - Or install via command line:
     ```bash
     # Using winget
     winget install Microsoft.VisualStudio.2022.BuildTools
     ```

2. Install Python (if not already installed):
   ```bash
   # Using winget
   winget install Python.Python.3.11
   ```

3. Rebuild keytar:
   ```bash
   npm rebuild keytar
   # or
   yarn rebuild keytar
   ```

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

### Common Issues

#### `Cannot find module '../build/Release/keytar.node'`
This error occurs on all platforms when the `keytar` native module isn't properly built.

**Windows:**
- Ensure Visual Studio Build Tools are installed with C++ workload
- Install Python for node-gyp
- Rebuild keytar: `npm rebuild keytar` or `yarn rebuild keytar`

**macOS:**
- Ensure Xcode Command Line Tools are installed: `xcode-select --install`
- Rebuild keytar: `npm rebuild keytar`

**Linux:**
- Install libsecret development packages (see Linux Installation section)
- Rebuild keytar: `npm rebuild keytar`

#### Missing `libsecret` errors (Linux only)
- Ensure you have installed both the runtime and development packages (e.g., `libsecret-1-0` and `libsecret-1-dev` on Ubuntu/Debian).

#### General Solutions
- **Rebuild keytar:**
  ```bash
  npm rebuild keytar
  # or
  yarn rebuild keytar
  ```
- **Clean install:**
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  # or
  rm -rf node_modules yarn.lock
  yarn install
  ```

#### Still having issues?
- **Windows:** Check that Visual Studio Build Tools are properly installed and Python is in your PATH
- **macOS:** Verify Xcode Command Line Tools are installed and up to date
- **Linux:** Ensure your system keyring (e.g., GNOME Keyring or KWallet) is running and unlocked. On some headless or minimal Linux environments, you may need to start or configure the keyring daemon manually.
- See the [`keytar` troubleshooting guide](https://github.com/atom/node-keytar#troubleshooting).
- Consult your distribution's documentation for keyring setup.

## Resources
- [`keytar` documentation](https://github.com/atom/node-keytar)
- [`libsecret` project page](https://wiki.gnome.org/Projects/Libsecret)
- [@azure/msal-node](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-node)