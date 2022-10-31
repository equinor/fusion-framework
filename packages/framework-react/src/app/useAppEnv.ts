import { useApp } from './useApp';
import { useAppConfig } from './useAppConfig';

export const useAppEnv = (appKey: string) => {
    const { value: manifest, isLoading: manifestLoading } = useApp(appKey);
    const { value: config, isLoading: configLoading } = useAppConfig({ appKey });

    return { manifest, config, isLoading: manifestLoading || configLoading };
};

export default useApp;
