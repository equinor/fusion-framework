import { useParams } from 'react-router-dom';
import AppLoader from '../AppLoader';

export const AppRoute = () => {
    const { appKey } = useParams();
    return appKey ? <AppLoader appKey={appKey} /> : null;
};
