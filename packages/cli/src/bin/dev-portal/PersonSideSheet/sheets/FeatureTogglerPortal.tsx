import { useFrameworkFeatureFlags } from '@equinor/fusion-framework-react/feature-flag';

import { Typography, Switch } from '@equinor/eds-core-react';

import { Styled } from './Styled';

/**
 * Content for Feature toggler tab for portal features in the PersonSidesheet's Feature page.
 */
export const FeatureTogglerPortal = () => {
    const { features, setFeatureEnabled } = useFrameworkFeatureFlags();
    return (
        <Styled.SwitchList>
            {features?.map((feature) => {
                return (
                    <Styled.SwitchListItem
                        key={`feat-${feature.key}`}
                        onClick={() => setFeatureEnabled(feature.key, !feature.enabled)}
                    >
                        <Styled.SwitchLabel>
                            <Typography variant="body_short_bold">
                                {feature.title ?? feature.key}
                            </Typography>
                            <Typography variant="body_short_italic">
                                {feature.description ?? ''}
                            </Typography>
                        </Styled.SwitchLabel>
                        <Switch checked={feature.enabled} disabled={feature.readonly} />
                    </Styled.SwitchListItem>
                );
            })}
        </Styled.SwitchList>
    );
};

export default FeatureTogglerPortal;
