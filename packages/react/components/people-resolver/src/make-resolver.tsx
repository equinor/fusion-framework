import { lazy } from 'react';
import { PeopleResolverComponent } from './PeopleResolverComponent.js';
import { PersonController, type PersonControllerOptions } from './PersonController.js';
import { createResolver } from './create-resolver.js';
import type { IApiProvider } from '@equinor/fusion-framework-module-services';

export const makeResolver = (services: IApiProvider, options?: PersonControllerOptions) => {
  return lazy(async () => {
    const client = await services.createPeopleClient();
    const controller = new PersonController(client, options);
    const resolver = createResolver(controller);
    // biome-ignore lint/correctness/noComponentHookFactories: created once per lazy() load to bind the resolver; it is the module's default export, not re-created on render
    const Component = ({ children }: { readonly children?: React.ReactNode }) => (
      <PeopleResolverComponent resolver={resolver}>{children}</PeopleResolverComponent>
    );
    return {
      default: Component,
    };
  });
};
