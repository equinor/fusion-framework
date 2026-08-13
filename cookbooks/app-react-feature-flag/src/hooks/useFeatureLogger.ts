import { useEffect } from 'react';
import { useAppModule } from '@equinor/fusion-framework-react-app';

/**
 * Subscribes to feature-flag events and logs each toggle for cookbook inspection.
 * @returns Nothing; the hook registers event listeners for the component lifetime.
 */
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
