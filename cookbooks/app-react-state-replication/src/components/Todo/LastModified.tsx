import type { FC } from 'react';

interface LastModifiedProps {
  lastModified?: string;
}

export const LastModified: FC<LastModifiedProps> = ({ lastModified }) =>
  lastModified ? (
    <div style={{ marginTop: '8px', fontSize: '12px', color: '#6c757d' }}>
      Last modified: {new Date(lastModified).toLocaleString()}
    </div>
  ) : null;
