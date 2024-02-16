import { Widget } from '@equinor/fusion-framework-react-app/widget';
import { useState } from 'react';

export const App = () => {
    const [state, setState] = useState('Hello World from Widget App');

    return (
        <div
            style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#f494b4',
            }}
        >
            <div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        background: '#f494b4',
                    }}
                >
                    <h1>🚀 Hello Fusion Widget 😎</h1>
                    <div
                        style={{
                            padding: '1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '.5rem',
                        }}
                    >
                        <label htmlFor="widget1-state">Widget 1 props state</label>
                        <input
                            style={{
                                padding: '0.5rem',
                                width: '500px',
                            }}
                            onChange={(e) => {
                                setState(e.currentTarget.value);
                            }}
                            id="widget1-state"
                            value={state}
                        />
                    </div>
                    <div
                        style={{
                            padding: '1rem',
                            display: 'flex',
                            flexDirection: 'row',
                            gap: '1rem',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Widget name="widget1" props={{ test: state }} />
                        <Widget name="widget2" />
                    </div>
                </div>
            </div>
        </div>
    );
};
export default App;
