import { IFeatureFlag } from '@equinor/fusion-framework-module-feature-flag';
import { Switch, Typography } from '@equinor/eds-core-react';

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
