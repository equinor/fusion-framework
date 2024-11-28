import { useAppSettings, useAppSetting } from '@equinor/fusion-framework-react-app/settings';

type MyAppSettings = {
    theme: 'none' | 'light' | 'dark';
    size: 'small' | 'medium' | 'large';
};

declare module '@equinor/fusion-framework-react-app/settings' {
    interface AppSettings extends MyAppSettings {}
}

export const App = () => {
    const { setting: theme, setSetting: setTheme } = useAppSetting('theme');
    const { setting: size, setSetting: setSize } = useAppSetting('size', 'medium');

    const { settings } = useAppSettings();

    return (
        <div
            style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: size === 'small' ? '0.6rem' : size === 'large' ? '2rem' : '1rem',
                background:
                    theme === 'light' ? '#f0f0f0' : theme === 'dark' ? '#343434' : '#f97fcc',
                color: theme === 'dark' ? '#f0f0f0' : '#343434',
            }}
        >
            <div
                style={{
                    background: theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                    padding: '1em',
                }}
            >
                <h1>🚀 Hello Fusion Settings 🔧</h1>
                <section style={{ display: 'grid', gridTemplateColumns: '3em auto', gap: '1rem' }}>
                    <span>Theme:</span>
                    <select
                        value={theme}
                        onChange={(e) => setTheme(e.currentTarget.value as MyAppSettings['theme'])}
                    >
                        <option value="none">None</option>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                    </select>
                </section>
                <section style={{ display: 'grid', gridTemplateColumns: '3em auto', gap: '1rem' }}>
                    <span>Size:</span>
                    <select
                        value={size}
                        onChange={(e) => setSize(e.currentTarget.value as MyAppSettings['size'])}
                    >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                    </select>
                </section>
                <div>
                    <span>App settings:</span>
                    <br />
                    <pre>{JSON.stringify(settings, null, 2)}</pre>
                </div>
            </div>
        </div>
    );
};

export default App;
