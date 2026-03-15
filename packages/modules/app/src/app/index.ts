/**
 * Re-exports for the app sub-module.
 *
 * - {@link App} – Concrete application class managing reactive state.
 * - {@link IApp} – Public interface for an application instance.
 * - {@link AppInitializeResult} – Shape emitted by `App.initialize()`.
 */
export { App, IApp, type AppInitializeResult } from './App';

export { default } from './App';
