import type { IFeatureFlag } from '@equinor/fusion-framework-module-feature-flag';
import { Switch, Typography } from '@equinor/eds-core-react';

/**
 * Renders one feature flag with its label, description, and toggle control.
 * @param args - The flag data and callback used to change its enabled state.
 * @returns A feature flag row suitable for a feature settings view.
 */
export const FeatureFlag = (args: { onToggle: () => void; flag: IFeatureFlag }) => {
  const { onToggle, flag } = args;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div>
        <Typography group="table" variant="cell_header">
          {flag.title ?? flag.key}
        </Typography>
        <Typography group="table" variant="cell_text">
          {flag.description}
        </Typography>
      </div>
      <Switch checked={flag.enabled} disabled={flag.readonly} onChange={() => onToggle()} />
    </div>
  );
};

export default FeatureFlag;
