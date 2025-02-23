import { firstValueFrom, map } from 'rxjs';

import type { PersonDetails, PersonInfo, PersonResolver } from '@equinor/fusion-wc-person';
import type { IPersonController } from './PersonController';

export const createResolver = (controller: IPersonController): PersonResolver => ({
  getDetails(args) {
    return firstValueFrom(
      controller.getPerson(args).pipe(
        /** TODO */
        map((x) => ({ ...x, azureId: x.azureUniqueId }) as unknown as PersonDetails),
      ),
    );
  },
  getInfo(args) {
    return firstValueFrom(
      controller.getPersonInfo(args).pipe(
        /** TODO */
        map((x) => ({ ...x, azureId: x.azureUniqueId }) as unknown as PersonInfo),
      ),
    );
  },
  getPhoto(args) {
    return firstValueFrom(controller.getPhoto(args));
  },
  search(args) {
    return firstValueFrom(
      controller.search(args).pipe(
        map((x) =>
          x.map(
            (x) =>
              ({
                ...x,
                azureId: x.azureUniqueId,
                // TODO
                // @asbjornhaland
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore https://github.com/equinor/fusion-web-components/issues/804
              }) as unknown as PersonInfo,
          ),
        ),
      ),
    );
  },
});

export default createResolver;
