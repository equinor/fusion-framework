import { useEffect } from 'react';
import { useAppModule } from '@equinor/fusion-framework-react-app';

export const useFeatureLogger = () => {
    const eventProvider = useAppModule('event');
    useEffect(
        () =>
            eventProvider.addEventListener('onFeatureFlagToggle', (e) => {
                console.log('APP', 'feature toggle', e.detail);
            }),
        [eventProvider],
    );
    useEffect(
        () =>
            eventProvider.addEventListener('onFeatureFlagsToggled', (e) => {
                console.log('APP', 'feature toggled', e.detail);
            }),
        [eventProvider],
    );
};
