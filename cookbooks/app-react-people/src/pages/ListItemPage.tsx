import { PersonListItem } from '@equinor/fusion-react-person';
import { FlexGridColumn } from '../Styled';

export const ListItemPage = () => {
    return (
        <>
            <h2>PersonListItem</h2>
            <FlexGridColumn>
                <PersonListItem azureId="cbc6480d-12c1-467e-b0b8-cfbb22612daa" />
                <PersonListItem upn="handah@equinor.com" />
            </FlexGridColumn>
        </>
    );
};
