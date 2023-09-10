import { Suspense, useMemo } from 'react';
import { ServicesModule } from '@equinor/fusion-framework-module-services';
import { useModule } from '@equinor/fusion-framework-react-module';
import { makeResolver } from './makeResolver';

export const PeopleResolverProvider = ({ children }: { readonly children?: React.ReactNode }) => {
    const services = useModule<ServicesModule>('services');
    if (!services) {
        throw Error('missing service module');
    }
    const Component = useMemo(() => makeResolver(services), [services]);
    return (
        <Suspense fallback={<span>TODO</span>}>
            <Component>{children}</Component>
        </Suspense>
    );
};

export default PeopleResolverProvider;
