import { useCurrentAppFeatures } from '@equinor/fusion-framework-react/feature-flag';

import { Typography, Switch } from '@equinor/eds-core-react';

import { Styled } from './Styled';

/**
 * Feature toggle list for application-level feature flags.
 *
 * Reads feature flags from the current app's feature-flag module and renders
 * each flag as a labeled switch. Clicking a row toggles the flag.
 */
export const FeatureTogglerApp = () => {
  const { features, toggleFeature } = useCurrentAppFeatures();
  return (
    <Styled.SwitchList>
      {features?.map((feature) => {
        return (
          <Styled.SwitchListItem
            key={`feat-${feature.key}`}
            onClick={() => toggleFeature(feature.key)}
          >
            <Styled.SwitchLabel>
              <Typography variant="body_short_bold">{feature.title ?? feature.key}</Typography>
              {feature.description && (
                <Typography variant="body_short_italic">{feature.description}</Typography>
              )}
            </Styled.SwitchLabel>
            <Styled.Switch>
              <Switch checked={feature.enabled} disabled={feature.readonly} />
            </Styled.Switch>
          </Styled.SwitchListItem>
        );
      })}
    </Styled.SwitchList>
  );
};

export default FeatureTogglerApp;
