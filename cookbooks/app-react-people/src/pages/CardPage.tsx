import { PersonCard } from '@equinor/fusion-react-person';
import { FlexGrid } from '../Styled';
export const CardPage = () => {
    return (
        <>
            <h2>Card</h2>
            <FlexGrid>
                <PersonCard azureId="cbc6480d-12c1-467e-b0b8-cfbb22612daa" />
                <PersonCard upn="handah@equinor.com" />
            </FlexGrid>
        </>
    );
};
