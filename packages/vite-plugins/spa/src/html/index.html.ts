import { version } from '../version.js';

/**
 * Represents an HTML template string used for generating the main structure of an SPA (Single Page Application).
 *
 * @see {@link https://vite.dev/guide/env-and-mode.html#html-constant-replacement}
 *
 * The template includes placeholders for dynamic values such as:
 * - `%FUSION_SPA_TITLE%`: The title of the SPA.
 * - `%MODE%`: The mode of the application (e.g., development, production).
 * - `%FUSION_SPA_BOOTSTRAP%`: The path to the bootstrap script for initializing the SPA.
 *
 * Additionally, it includes:
 * - A meta tag for the plugin version, dynamically populated using the `version` variable.
 * - A link to the Equinor font stylesheet hosted on a CDN.
 *
 * @constant
 * @type {string}
 */
export const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <title>%FUSION_SPA_TITLE%</title>
      <meta name="mode" content="%MODE%">
      <meta name="fusion-spa-plugin-version" content="${version}">
      <link rel="stylesheet" href="https://cdn.eds.equinor.com/font/equinor-font.css" />
      <script type="module" src="%FUSION_SPA_BOOTSTRAP%"></script>
      <script>
        // suppress console error for custom elements already defined. 
        // WebComponents should be added by the portal, but not removed from application
        const _customElementsDefine = window.customElements.define;
        window.customElements.define = (name, cl, conf) => {
          if (!customElements.get(name)) {
            _customElementsDefine.call(window.customElements, name, cl, conf);
          }
        };
      </script>
      <style>
        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
          font-family: 'EquinorFont', sans-serif;
        }
      </style>
    </head>
    <body></body>
  </html>
`;

export default html;
