import { Outlet } from 'react-router-dom';
import Header from '../Header';

import { PersonProvider } from '@equinor/fusion-react-person';
import { usePersonResolver } from '../usePersonResolver';

export const Root = () => {
    const personResolver = usePersonResolver();
    return (
        <div style={{ fontFamily: 'Equinor' }}>
            <PersonProvider resolve={personResolver}>
                <Header />
                <Outlet />
            </PersonProvider>
        </div>
    );
};
