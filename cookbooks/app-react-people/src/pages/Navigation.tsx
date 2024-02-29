import { Outlet, useNavigate } from 'react-router-dom';
import { Button } from '@equinor/eds-core-react';

export const Navigation = () => {
    const navigate = useNavigate();
    return (
        <>
            <section style={{ display: 'inline-flex', gap: 10 }}>
                <Button onClick={() => navigate('')}>Home</Button>
                <Button onClick={() => navigate('avatar')}>PersonAvatar</Button>
                <Button onClick={() => navigate('card')}>PersonCard</Button>
                <Button onClick={() => navigate('list-item')}>PersonListItem</Button>
                <Button onClick={() => navigate('selector')}>PersonSelect</Button>
            </section>
            <Outlet></Outlet>
        </>
    );
};
