import { useCallback } from 'react';

import { useFrameworkFeatures } from '@equinor/fusion-framework-react/feature-flag';

import { Typography, Switch } from '@equinor/eds-core-react';

import { Styled } from './Styled';

/**
 * Content for Feature toggler tab for portal features in the PersonSidesheet's Feature page.
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
                        <Typography variant="body_short_bold">
                            {feature.title ?? feature.key}
                        </Typography>
                        <Typography variant="body_short_italic">
                            {feature.description ?? ''}
                        </Typography>
                    </Styled.SwitchLabel>
                    <Switch checked={feature.enabled} disabled={feature.readonly} />
                </Styled.SwitchListItem>
            ))}
        </Styled.SwitchList>
    );
};

export default FeatureTogglerPortal;
