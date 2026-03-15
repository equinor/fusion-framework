import { useFrameworkFeatures } from '@equinor/fusion-framework-react/feature-flag';

import { Typography, Switch } from '@equinor/eds-core-react';

import { Styled } from './Styled';

/**
 * Feature toggle list for portal-level feature flags.
 *
 * Reads feature flags from the framework's feature-flag module and renders
 * each flag as a labeled switch. Clicking a row toggles the flag.
 */
export const FeatureTogglerPortal = () => {
  const { features, toggleFeature } = useFrameworkFeatures();
  return (
    <Styled.SwitchList>
      {features?.map((feature) => (
        <Styled.SwitchListItem
          key={`feat-${feature.key}`}
          onClick={() => toggleFeature(feature.key)}
        >
          <Styled.SwitchLabel>
            <Typography variant="body_short_bold">{feature.title ?? feature.key}</Typography>
            <Typography variant="body_short_italic">{feature.description ?? ''}</Typography>
          </Styled.SwitchLabel>
          <Switch checked={feature.enabled} disabled={feature.readonly} />
        </Styled.SwitchListItem>
      ))}
    </Styled.SwitchList>
  );
};

export default FeatureTogglerPortal;
