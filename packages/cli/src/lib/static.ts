/**
 * A constant array of supported asset file extensions categorized by type.
 *
 * The extensions are grouped as follows:
 * - **Images**: `png`, `jpg`, `jpeg`, `gif`, `svg`, `ico`, `webp`
 * - **Videos and audio**: `mp4`, `webm`, `mp3`
 * - **Fonts**: `woff2`, `woff`, `eot`, `ttf`, `otf`
 * - **Documents**: `pdf`, `md`, `txt`
 */
export const ASSET_EXTENSIONS = [
  // Images
  ...['png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'webp'],
  // Videos and audio
  ...['mp4', 'webm', 'mp3'],
  // Fonts
  ...['woff2', 'woff', 'eot', 'ttf', 'otf'],
  // Documents
  ...['pdf', 'md', 'txt'],
] as const;
