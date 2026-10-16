/**
 * Teardown callbacks keyed by the component returned from a component renderer.
 *
 * @internal
 */
export const componentTeardowns = new WeakMap<object, VoidFunction>();
