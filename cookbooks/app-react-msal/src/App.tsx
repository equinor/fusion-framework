import { useFramework } from '@equinor/fusion-framework-react-app/framework';
import {
    useAccessToken,
    useToken,
    useCurrentAccount,
} from '@equinor/fusion-framework-react-app/msal';
import { useEffect, useMemo, useState } from 'react';

export const App = () => {
    /**
     * Retrieves the current user account.
     * @returns The current user account.
     */
    const user = useCurrentAccount();
    const framework = useFramework();
    /**
     * This state variable is used to manage the scopes for MSAL authentication.
     */
    const [scopes, setScopes] = useState<string[]>([]);
    useEffect(() => {
        /**
         * get default scope from the framework service discovery module
         */
        framework.modules.serviceDiscovery
            .resolveService('portal')
            .then((x) => x.defaultScopes)
            .then(setScopes);
    }, [framework]);

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                flexFlow: 'column',
                padding: '0 2rem',
            }}
        >
            <div style={{ maxWidth: 'calc(100% - 4rem)', overflow: 'scroll' }}>
                <div>
                    <h1>😎 Current user:</h1>
                    <pre>{JSON.stringify(user, null, 2)}</pre>
                </div>
                {scopes.length && <AccessToken scopes={scopes} />}
            </div>
        </div>
    );
};

/**
 * Component for rendering an access token.
 * @param scopes - The scopes required for the access token.
 */
const AccessToken = ({ scopes }: { scopes: string[] }) => {
    const { token } = useToken(useMemo(() => ({ scopes }), [scopes]));
    const { token: accessToken } = useAccessToken(useMemo(() => ({ scopes }), [scopes]));
    return (
        <div>
            <h2>🧩 Token:</h2>
            <b>access token</b>
            <br />
            <code style={{ lineBreak: 'anywhere' }}>{accessToken}</code>
            <br />
            <br />
            <b>token response</b>
            <code>
                <pre style={{ overflow: 'scroll' }}>{JSON.stringify(token, null, 4)}</pre>
            </code>
        </div>
    );
};

export default App;
