import { AppRouter } from './Router';
import { styled } from 'styled-components';

const Styled = {
    Root: styled.div`
        background: linear-gradient(
            180deg,
            rgba(0, 0, 0, 1) 0%,
            rgba(9, 9, 121, 1) 45%,
            rgb(135, 125, 246) 100%
        );
        min-height: 100%;
        overflow: auto;
    `,
    Container: styled.div`
        width: 860px;
        /* min-height: 45vh; */
        margin: 1em auto;
        padding: 2em;
        background-color: white;
        border-radius: 7px;
    `,
};

export const App = () => {
    return (
        <Styled.Root>
            <Styled.Container>
                <AppRouter />
            </Styled.Container>
        </Styled.Root>
    );
};

export default App;
