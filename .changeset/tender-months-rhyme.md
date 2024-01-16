---
'@equinor/fusion-framework-cli': patch
---

added support for dev of portals

  1. In the file packages/cli/src/bin/create-dev-serve.ts, the devPortalPath variable is replaced with an object called devPortal that contains properties path and static. The path property specifies the path to resolve cli internal assets from, and the static property
  determines whether the assets are static or not.                                                                                                                                                                                                                         
  2. In the same file, the usage of the devPortalPath variable is replaced with devPortal.path when resolving cli internal assets.                                                                                                                                         
  3. The file packages/cli/src/bin/main.app.ts now sets the devPortal property to an object that contains path and static properties, instead of using the devPortalPath directly.                                                                                         
  4. A new file packages/cli/src/bin/main.portal.ts is added. This file defines the dev command for creating a development server. It uses the createDevServer function and includes options such as port, portal, framework, and dev-portal.                              
  5. The file packages/cli/src/bin/main.ts modifies the program to include the portal commands from main.portal.js.      
