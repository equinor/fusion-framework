import { useLocation } from '@equinor/fusion-framework-react-router';

import { useRoutingDiagnostics, useCrossAppNavigation, useStrategySwitch } from '../hooks';
import { getOutsideFrameworkRouteBHref } from '../utils/url';
import { StrategyButtons } from './StrategyButtons';
import { CrossAppSection } from './CrossAppSection';
import { DiagnosticsDisplay } from './DiagnosticsDisplay';

/**
 * Diagnostic panel that visualises how context routing behaves at runtime.
 *
 * Lets the developer:
 * 1. Switch between routing strategies (query / path / custom / none)
 * 2. Perform a hard navigation to verify re-initialisation
 * 3. Remove context from the URL to test fallback behaviour
 * 4. Navigate to sibling apps to verify cross-app context handoff
 * 5. Inspect raw diagnostics: strategy, pathname, search, init source,
 *    and the resolved context object
 */
export function RouteStatePanel() {
  const diagnostics = useRoutingDiagnostics();
  const { navigateToApp } = useCrossAppNavigation();
  const { setRoutingStrategy, removeContextFromUrl } = useStrategySwitch();
  const location = useLocation();

  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      <StrategyButtons
        activeStrategy={diagnostics.strategy}
        onStrategyChange={setRoutingStrategy}
        hardNavigateHref={getOutsideFrameworkRouteBHref(location.pathname)}
        onRemoveContext={removeContextFromUrl}
      />

      <CrossAppSection navigateToApp={navigateToApp} />

      <DiagnosticsDisplay diagnostics={diagnostics} />
    </div>
  );
}

export default RouteStatePanel;
