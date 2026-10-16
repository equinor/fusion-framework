import { componentTeardowns } from './component-teardowns.js';

/**
 * Releases the app modules (and the navigation history they own) created for a
 * component returned by a {@link ComponentRenderer}. Safe to call before
 * initialization completes and more than once.
 *
 * @internal
 * @param component - The component returned by the renderer
 */
export const disposeComponent = (component: object): void => {
  componentTeardowns.get(component)?.();
};
