import { PersonCard } from '@equinor/fusion-react-person';

export const CardPage = () => {
    return (
        <>
            <h2>Card</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
                <PersonCard azureId="cbc6480d-12c1-467e-b0b8-cfbb22612daa" />
                <PersonCard upn="handah@equinor.com" />
            </div>
        </>
    );
};
