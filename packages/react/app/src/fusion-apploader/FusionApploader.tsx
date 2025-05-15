import { useEffect, useRef } from 'react';
import { useAppLoader } from './useAppLoader';

export type FusionApploaderProps = {
  appKey: string;
};

export const FusionApploader = ({ appKey }: FusionApploaderProps): JSX.Element => {
  const refWrapp = useRef<HTMLDivElement | null>(null);
  const { loading, error, appRef } = useAppLoader({ appKey });

  useEffect(() => {
    if (!refWrapp.current || !appRef.current) {
      return;
    }

    refWrapp.current.appendChild(appRef.current);
  }, [appRef]);
  if (loading) {
    return <div>Loading {appKey}</div>;
  }
  
  if (error) {
    return <div>Error loading {appKey}. Error: {error.message}</div>;
  }

  return <div ref={refWrapp}></div>;
};

export default FusionApploader;
