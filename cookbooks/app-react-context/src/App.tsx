import { useModuleCurrentContext } from '@equinor/fusion-framework-react-module-context';
import { StrictMode } from 'react';

export const App = () => {
    const { currentContext } = useModuleCurrentContext();
    return (
        <StrictMode>
            <pre>{JSON.stringify(currentContext, null, 4)}</pre>
        </StrictMode>
    );
};

export default App;
