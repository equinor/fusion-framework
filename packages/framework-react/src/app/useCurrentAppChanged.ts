import { FrameworkEventMap } from '@equinor/fusion-framework-module-event';
import { useEffect } from 'react';
import { useFramework } from '../hooks/use-framework';

export const useCurrentAppChanged = (
    cb: (e: FrameworkEventMap['onCurrentAppChanged']) => Promise<void> | void
) => {
    const { event } = useFramework().modules;
    useEffect(() => event.addEventListener('onCurrentAppChanged', cb), [event, cb]);
};

export default useCurrentAppChanged;
