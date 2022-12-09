import { useAppManifest } from './useAppManifest';
import { useAppConfig } from './useAppConfig';

export const useAppEnv = (appKey: string) => {
    const { value: manifest, isLoading: manifestLoading } = useAppManifest(appKey);
    const { value: config, isLoading: configLoading } = useAppConfig({ appKey });

    return { manifest, config, isLoading: manifestLoading || configLoading };
};

export default useAppEnv;
