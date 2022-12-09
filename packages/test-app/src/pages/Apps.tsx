import { useCallback, useEffect, useState } from 'react';

import {
    useAppConfig,
    useAppManifests,
    useCurrentApp,
    useCurrentAppChanged,
} from '@equinor/fusion-framework-react/app';

import { CodeInfo } from '../components';

export const CurrentApp = () => {
    const apps = useAppManifests();
    const { currentApp, setCurrentApp } = useCurrentApp();
    const [appKey, setAppKey] = useState('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [changeEvent, setChangeEvent] = useState<any>(null);

    const appConfig = useAppConfig({ appKey });

    useCurrentAppChanged(useCallback((e) => setChangeEvent(e.detail), [setChangeEvent]));

    useEffect(() => {
        appKey && setCurrentApp(appKey);
    }, [setCurrentApp, appKey]);

    if (!apps.value) {
        return <p>loading all apps</p>;
    }

    return (
        <div>
            <h2>Current App</h2>
            <select onChange={(e) => setAppKey(e.currentTarget.value)}>
                {apps.value.map((app) => {
                    const { appKey, name } = app;
                    return (
                        <option key={appKey} value={appKey}>
                            {name}
                        </option>
                    );
                })}
            </select>
            <CodeInfo data={currentApp} />
            <div>
                <h3>App Config</h3>
                {!!appConfig.value && <CodeInfo data={appConfig.value} />}
            </div>
            <div style={{ color: 'white', backgroundColor: '#333', padding: 10 }}>
                <h2>Last event</h2>
                <CodeInfo data={changeEvent} />
            </div>
        </div>
    );
};

export default CurrentApp;
