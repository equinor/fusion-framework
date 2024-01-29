import { useCurrentAppFeatures } from '@equinor/fusion-framework-react/feature-flag';

import { Typography, Switch } from '@equinor/eds-core-react';

import { Styled } from './Styled';

/**
 * JSX structure for Feature toggler tab for app features in the PersonSidesheet's Feature page.
 */
export const FeatureTogglerApp = () => {
    const { features, setEnabled } = useCurrentAppFeatures();
    return (
        <Styled.SwitchList>
            {features?.map((feature) => {
                return (
                    <Styled.SwitchListItem
                        key={`feat-${feature.key}`}
                        onClick={() => setEnabled(feature.key, !feature.enabled)}
                    >
                        <Styled.SwitchLabel>
                            <Typography variant="body_short_bold">
                                {feature.title ?? feature.key}
                            </Typography>
                            {feature.description && (
                                <Typography variant="body_short_italic">
                                    {feature.description}
                                </Typography>
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
