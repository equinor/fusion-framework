import { CircularProgress } from '@equinor/eds-core-react';
import React from 'react';

export const Loading = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      width: '100%',
    }}
  >
    <CircularProgress />
  </div>
);
