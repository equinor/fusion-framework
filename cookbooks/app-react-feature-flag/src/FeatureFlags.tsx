import { useFeature } from '@equinor/fusion-framework-react-app/feature-flag';

import { Feature } from './static';

import { Switch, Typography } from '@equinor/eds-core-react';

export const FeatureFlags = () => {
    const basicFeature = useFeature(Feature.Basic);
    const descriptionFeature = useFeature(Feature.WithDescription);
    const disabledFeature = useFeature(Feature.ReadOnly);
    const valueFeature = useFeature<string>(Feature.WithValue);

    const features = [basicFeature, descriptionFeature, disabledFeature, valueFeature];

    return (
        <div style={{ padding: 10 }}>
            <Typography
                variant="h1"
                token={{
                    color: valueFeature.feature?.enabled ? valueFeature.feature.value : undefined,
                }}
            >
                Feature Flags
            </Typography>
            <div style={{ display: 'flex', flexFlow: 'column', padding: '1rem' }}>
                {features.map(({ feature, toggleFeature }) => {
                    return feature ? (
                        <div
                            key={feature.key}
                            style={{ display: 'flex', justifyContent: 'space-between' }}
                        >
                            <div>
                                <Typography group="table" variant="cell_header">
                                    {feature.title ?? feature.key}
                                </Typography>
                                <Typography group="table" variant="cell_text">
                                    {feature.description}
                                </Typography>
                            </div>
                            <Switch
                                checked={feature.enabled}
                                disabled={feature.readonly}
                                onChange={() => toggleFeature()}
                            />
                        </div>
                    ) : null;
                })}
            </div>
        </div>
    );
};

export default Feature;
