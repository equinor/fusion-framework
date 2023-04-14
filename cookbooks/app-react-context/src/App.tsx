import { useModuleCurrentContext } from '@equinor/fusion-framework-react-module-context';
import { useRelatedContext } from './useRelatedContext';

export const App = () => {
    const { currentContext } = useModuleCurrentContext();
    // const { relatedContext } = useRelatedContext(['EquinorTask']);
    const { relatedContext } = useRelatedContext();
    return (
        <>
            <section>
                <h3>Current Context:</h3>
                <pre>{JSON.stringify(currentContext, null, 4)}</pre>
            </section>
            <section>
                <h3>Related Context:</h3>
                <pre>{JSON.stringify(relatedContext, null, 4)}</pre>
            </section>
        </>
    );
};

export default App;
