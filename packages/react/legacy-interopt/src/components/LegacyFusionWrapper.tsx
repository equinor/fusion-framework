/* eslint-disable react/no-multi-comp */
import {
  type PropsWithChildren,
  type ReactChild,
  type ReactElement,
  type ReactNode,
  Suspense,
  useMemo,
  useRef,
} from 'react';

import { FusionRoot } from '@equinor/fusion-components';

import { createLegacyContextComponent } from './create-legacy-context-component';
import type { PortalFramework } from '../types';
import type { FusionContextOptions } from '../create-fusion-context';

export type LegacyFusionWrapperProps = {
  readonly loader: NonNullable<ReactNode>;
  readonly framework: PortalFramework;
  readonly options?: FusionContextOptions;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly RootWrapper?: (props: { children: ReactChild }) => ReactElement<any, any>;
};

const FusionRootExtended = FusionRoot as unknown as React.FC<
  React.PropsWithChildren<React.ComponentProps<typeof FusionRoot>>
>;

const FallThrewComponent = ({
  children,
}: {
  readonly children: ReactChild;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): ReactElement<any, any> => <>{children}</>;

export const LegacyFusionWrapper = (props: PropsWithChildren<LegacyFusionWrapperProps>) => {
  const { framework, options, loader, RootWrapper = FallThrewComponent } = props;
  const root = useRef<HTMLElement | null>(null);
  const overlay = useRef(null);
  const headerContent = useRef<HTMLElement | null>(null);
  const headerAppAside = useRef<HTMLElement | null>(null);
  const LegacyContext = useMemo(
    () =>
      createLegacyContextComponent({
        framework,
        options,
        refs: { root, overlay, headerContent, headerAppAside },
      }),
    [framework, options],
  );
  return (
    <Suspense fallback={loader}>
      <LegacyContext>
        <RootWrapper>
          <FusionRootExtended rootRef={root} overlayRef={overlay}>
            {props.children}
          </FusionRootExtended>
        </RootWrapper>
      </LegacyContext>
    </Suspense>
  );
};

export default LegacyFusionWrapper;
