import { PersonAvatar } from '@equinor/fusion-react-person';

export const AvatarPage = () => {
    return (
        <>
            <h2>Avatar</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
                <PersonAvatar azureId="cbc6480d-12c1-467e-b0b8-cfbb22612daa" />
                <PersonAvatar upn="handah@equinor.com" />
            </div>
        </>
    );
};
