import { PropsWithChildren, Suspense, useMemo } from 'react';
import { ServicesModule } from '@equinor/fusion-framework-module-services';
import { useModule } from '@equinor/fusion-framework-react-module';
import { makeResolver } from './makeResolver';
import { PersonControllerOptions } from './PersonController';

type PeopleResolverProviderProps = PropsWithChildren<{
    readonly options?: PersonControllerOptions;
}>;

export const PeopleResolverProvider = (props: PeopleResolverProviderProps) => {
    const { children, options } = props;
    const services = useModule<ServicesModule>('services');
    if (!services) {
        throw Error('missing service module');
    }
    const Component = useMemo(() => makeResolver(services, options), [services, options]);
    return (
        <Suspense fallback={<span>TODO</span>}>
            <Component>{children}</Component>
        </Suspense>
    );
};

export default PeopleResolverProvider;
