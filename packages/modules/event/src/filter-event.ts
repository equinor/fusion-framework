import { filter } from 'rxjs';
import type { FrameworkEventMap, IFrameworkEvent } from './event';

export const filterEvent = <TType extends keyof FrameworkEventMap>(type: TType) =>
  filter((x: IFrameworkEvent): x is FrameworkEventMap[TType] => x.type === type);

export default filterEvent;
