import { WidgetManifest } from './types';

export const compareWidgetManifest = <T extends WidgetManifest>(a?: T, b?: T): boolean =>
    JSON.stringify(a) === JSON.stringify(b);
