import { useEffect, useRef } from 'react';
import { useApploader } from './useApploader';

export type ApploaderProps = {
  appKey: string;
};

/**
 * Apploader component
 *
 * Embeds a Fusion child application inside a parent Fusion application.
 * Handles loading and error states, and mounts the child app's DOM element into a container div.
 *
 * @param { ApploaderProps } props - The props for the component.
 * @param { string } props.appKey - The key of the Fusion app to load and mount.
 * @returns { JSX.Element } The rendered component, which displays loading, error, or the embedded app.
 *
 * @example
 * <Apploader appKey="my-app" />
 */
export const Apploader = ({ appKey }: ApploaderProps): JSX.Element => {
  const refWrapp = useRef<HTMLDivElement | null>(null);
  const { loading, error, appRef } = useApploader({ appKey });

  useEffect(() => {
    if (!refWrapp.current || !appRef.current) {
      return;
    }

    refWrapp.current.appendChild(appRef.current);
  }, [appRef.current]);

  if (loading) {
    return <div>Loading {appKey}</div>;
  }
  if (error) {
    return (
      <div>
        Error loading {appKey}. Error: {error.message}
      </div>
    );
  }

  return <div ref={refWrapp} />;
};

export default Apploader;
