import { AppManifest } from './types';

export const compareAppManifest = <T extends AppManifest>(a?: T, b?: T): boolean =>
    JSON.stringify(a) === JSON.stringify(b);
