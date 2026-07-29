/**
 * URL search-parameter key used to specify an app version tag.
 *
 * When present in the URL as `?$tag=<value>`, the portal loads that
 * specific version of the application instead of the default.
 */
const TAG = '$tag';

/**
 * Reads the application version tag from the current URL search parameters.
 *
 * @returns The tag string if the `$tag` search parameter is present, otherwise `null`.
 */
export const getAppTagFromUrl = (): string | null => {
  const url = new URL(window.location.href);
  return url.searchParams.get(TAG);
};
