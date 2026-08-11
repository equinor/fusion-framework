import type { AppScriptModule } from '@equinor/fusion-framework-module-app';

// a minimal stand-in for a real app bundle's entry point, dynamically imported by `App.initialize()`
export const renderApp: AppScriptModule['renderApp'] = (el, { env }) => {
  el.textContent = `mounted: ${env.manifest?.appKey}`;
  return () => {
    el.textContent = '';
  };
};
