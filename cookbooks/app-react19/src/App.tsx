import { useMemo } from "react";
import { useCurrentUser } from '@equinor/fusion-framework-react/hooks'

export const App = () => {
    const pp = useCurrentUser();
    
    const gg = `User: ${pp?.username}`;
    // const gg = useMemo(() => {
    //     return `unix ts ${Date.now()} for user: ${pp?.username}`;
    // }, [pp]);

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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h1>🚀 Hello Fusion react@19-beta 😎</h1>
                <p>Timestamp stamp: {gg}</p>
            </div>
        </div>
    );
}

export default App;
