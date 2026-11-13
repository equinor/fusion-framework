import edsVariablesCss from '@equinor/eds-tokens/css/variables?inline';

/** Media query for the OS/browser dark colour preference. */
const darkSchemeQuery = '(prefers-color-scheme: dark)';

/** Element id of the injected EDS variables stylesheet, used to avoid duplicate injection. */
const edsVariablesStyleId = 'fusion-dev-portal-eds-variables';

/**
 * Page backdrop behind the portal and hosted apps. Without it, the browser canvas shows through
 * and turns black in dark mode.
 */
const pageBackgroundCss = 'html, body { background-color: var(--eds-color-bg-neutral-surface); }';

/** EDS colour scheme values supported by `data-color-scheme`. */
type EdsColorScheme = 'light' | 'dark';

/**
 * Installs EDS CSS custom properties and keeps the page colour scheme in sync with the system.
 *
 * The dev portal is a library build, so a plain CSS import would not reach the page.
 * The EDS variables stylesheet is therefore inlined and injected once into `<head>`, together
 * with a page background using the EDS neutral surface colour.
 * `data-color-scheme` on `<html>` is set from `prefers-color-scheme` and updated when the
 * preference changes, so EDS `var(--eds-color-…)` values, native controls and AG Grid
 * follow the active scheme.
 *
 * @param doc - Document to install into; defaults to the global `document`.
 * @returns A cleanup function that stops listening for preference changes.
 */
export const installEdsColorScheme = (doc: Document = document): (() => void) => {
  // Render can run more than once (HMR, remounts); inject the stylesheet only once.
  if (!doc.getElementById(edsVariablesStyleId)) {
    const style = doc.createElement('style');
    style.id = edsVariablesStyleId;
    style.textContent = [edsVariablesCss, pageBackgroundCss].join('\n');
    doc.head.appendChild(style);
  }

  const view = doc.defaultView;
  // Without matchMedia (non-browser hosts) there is no preference to follow; default to light.
  if (!view?.matchMedia) {
    doc.documentElement.dataset.colorScheme = 'light';
    return () => {};
  }

  const query = view.matchMedia(darkSchemeQuery);
  const apply = (dark: boolean): void => {
    doc.documentElement.dataset.colorScheme = (dark ? 'dark' : 'light') satisfies EdsColorScheme;
  };
  const onChange = (event: MediaQueryListEvent): void => apply(event.matches);

  apply(query.matches);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
};
