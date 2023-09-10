import { lazy } from 'react';
import { PeopleResolver } from './PeopleResolver';
import { PersonController } from './PersonController';
import { createResolver } from './create-resolver';
import { IApiProvider } from '@equinor/fusion-framework-module-services';

export const makeResolver = (services: IApiProvider) => {
    return lazy(async () => {
        const client = await services.createPeopleClient();
        const controller = new PersonController(client);
        const resolver = createResolver(controller);
        const Component = ({ children }: { readonly children?: React.ReactNode }) => (
            <PeopleResolver resolver={resolver}>{children}</PeopleResolver>
        );
        return {
            default: Component,
        };
    });
};
