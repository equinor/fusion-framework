import { AppRouter } from './Router';
import { styled } from 'styled-components';

const Centered = styled.div`
    width: 860px;
    margin: 5em auto;
`;

export const App = () => {
    return (
        <Centered>
            <h1>Person Components</h1>
            <AppRouter />
        </Centered>
    );
};

export default App;
