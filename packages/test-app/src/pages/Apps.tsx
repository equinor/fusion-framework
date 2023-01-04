import { useMemo, useState } from 'react';

import { AppModule } from '@equinor/fusion-framework-module-app';

import { CodeInfo } from '../components';
import { useFramework } from '@equinor/fusion-framework-react';
import { EMPTY } from 'rxjs';
import { useObservableState } from '@equinor/fusion-observable/react';

export const CurrentApp = () => {
    const framework = useFramework<[AppModule]>();
    const [appKey, setAppKey] = useState('');

    const AppManifest = useObservableState(
        useMemo(() => (appKey ? framework.modules.app.getAppManifest(appKey) : EMPTY), [appKey])
    );
    const appConfig = useObservableState(
        useMemo(() => (appKey ? framework.modules.app.getAppConfig(appKey) : EMPTY), [appKey])
    );

    const apps = useObservableState(
        useMemo(() => framework.modules.app.getAllAppManifests(), [framework]),
        []
    );

    return (
        <div>
            <h2>Current App</h2>
            <select onChange={(e) => setAppKey(e.currentTarget.value)}>
                {apps.map((app) => {
                    const { key: appKey, name } = app;
                    return (
                        <option key={appKey} value={appKey}>
                            {name}
                        </option>
                    );
                })}
            </select>
            <CodeInfo data={AppManifest} />
            <div>
                <h3>App Config</h3>
                {!!appConfig && <CodeInfo data={appConfig} />}
            </div>
        </div>
    );
};

export default CurrentApp;
