import { PersonListItem } from '@equinor/fusion-react-person';

export const ListItemPage = () => {
    return (
        <>
            <h2>List item</h2>
            <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                <PersonListItem azureId="cbc6480d-12c1-467e-b0b8-cfbb22612daa" />
                <PersonListItem upn="handah@equinor.com" />
            </div>
        </>
    );
};
