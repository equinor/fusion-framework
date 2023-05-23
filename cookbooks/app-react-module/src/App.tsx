import { useModule } from '@equinor/fusion-framework-react-module';

export const App = () => {
    const demoProvider = useModule('demo');
    return (
        <>
            <h1>🚀 Hello custom module</h1>
            <p>foo: {demoProvider.foo}</p>
            <p>bar: {demoProvider.bar}</p>
        </>
    );
};

export default App;
