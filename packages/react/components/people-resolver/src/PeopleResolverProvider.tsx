import { type PropsWithChildren, type ReactNode, Suspense, useMemo } from 'react';
import type { ServicesModule } from '@equinor/fusion-framework-module-services';
import { useModule } from '@equinor/fusion-framework-react-module';
import { makeResolver } from './make-resolver';
import type { PersonControllerOptions } from './PersonController';

type PeopleResolverProviderProps = PropsWithChildren<{
  readonly options?: PersonControllerOptions;
  readonly fallback?: ReactNode;
}>;

/**
 * Provides person resolution to its children by wiring up a `PersonResolver` built from the
 * framework's `services` module.
 *
 * @param props - Component props
 * @param props.children - Elements that will have access to the person resolver
 * @param props.options - Optional controller options, such as a fallback image for missing photos
 * @param props.fallback - Optional fallback rendered while the resolver component is suspended
 * @returns The rendered people resolver provider wrapping the given children
 * @throws Error if the `services` module has not been registered on the framework
 */
export const PeopleResolverProvider = (props: PeopleResolverProviderProps) => {
  const { children, options, fallback } = props;
  const services = useModule<ServicesModule>('services');
  // Fail fast when the services module has not been registered on the framework
  if (!services) {
    throw Error('missing service module');
  }
  const Component = useMemo(() => makeResolver(services, options), [services, options]);
  return (
    <Suspense fallback={fallback || null}>
      <Component>{children}</Component>
    </Suspense>
  );
};

export default PeopleResolverProvider;
