import { useAppSettings } from '@equinor/fusion-framework-react-app/settings';
import { useCallback } from 'react';

export const App = () => {
    const { settings, updateSettings } = useAppSettings();

    console.log('settings', settings);

    const updateSettingsCallback = useCallback(() => {
        updateSettings({ theme: 'dark', date: new Date().toISOString() });
    }, []);

    return (
        <div
            style={{
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#f0f0f0',
                color: '#343434',
            }}
        >
            <h1>🚀 Hello Fusion 😎</h1>
            <button onClick={updateSettingsCallback}>SetSettings</button>
        </div>
    );
};

export default App;
