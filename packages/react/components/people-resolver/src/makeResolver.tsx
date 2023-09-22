import { lazy } from 'react';
import { PeopleResolverComponent } from './PeopleResolver';
import { PersonController, PersonControllerOptions } from './PersonController';
import { createResolver } from './create-resolver';
import { IApiProvider } from '@equinor/fusion-framework-module-services';

export const makeResolver = (services: IApiProvider, options?: PersonControllerOptions) => {
    return lazy(async () => {
        const client = await services.createPeopleClient();
        const controller = new PersonController(client, options);
        const resolver = createResolver(controller);
        const Component = ({ children }: { readonly children?: React.ReactNode }) => (
            <PeopleResolverComponent resolver={resolver}>{children}</PeopleResolverComponent>
        );
        return {
            default: Component,
        };
    });
};
