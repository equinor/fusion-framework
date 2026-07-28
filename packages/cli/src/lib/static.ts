/**
 * A constant array of supported asset file extensions categorized by type.
 *
 * The extensions are grouped as follows:
 * - **Images**: `png`, `jpg`, `jpeg`, `gif`, `svg`, `ico`, `webp`
 * - **Videos and audio**: `mp4`, `webm`, `mp3`
 * - **Fonts**: `woff2`, `woff`, `eot`, `ttf`, `otf`
 * - **Documents**: `pdf`, `md`, `txt`
 */
// Combine each category's extensions into a single flat lookup list
const assetExtensions = [
  // Images
  ...['png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'webp'],
  // Videos and audio
  ...['mp4', 'webm', 'mp3'],
  // Fonts
  ...['woff2', 'woff', 'eot', 'ttf', 'otf'],
  // Documents
  ...['pdf', 'md', 'txt'],
] as const;

export const ASSET_EXTENSIONS = assetExtensions;
