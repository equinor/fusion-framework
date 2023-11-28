import { useCallback, useState } from 'react';
import { Button } from '@equinor/eds-core-react';

import { PersonSideSheet } from './components/PersonSideSheet';

export const App = () => {
    const [isPersonOpen, setIsPersonOpen] = useState(false);

    const togglePersonSideSheet = useCallback(() => {
        setIsPersonOpen(() => !isPersonOpen);
    }, [isPersonOpen]);

    return (
        <>
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
                <div>
                    <h1>🚀 Hello Fusion 😎</h1>
                    <div>
                        <Button onClick={togglePersonSideSheet}>Open PersonSideSheet</Button>
                    </div>
                </div>
            </div>
            <PersonSideSheet
                isOpen={isPersonOpen}
                onClose={togglePersonSideSheet}
                azureId={'49132c24-6ea4-41fe-8221-112f314573f0'}
            />
        </>
    );
};

export default App;
