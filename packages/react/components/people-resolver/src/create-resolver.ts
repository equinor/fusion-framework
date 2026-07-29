import { firstValueFrom, map } from 'rxjs';

import type { PersonDetails, PersonInfo, PersonResolver } from '@equinor/fusion-wc-person';
import type { IPersonController } from './PersonController';

export const createResolver = (controller: IPersonController): PersonResolver => ({
  getDetails(args) {
    // Remap the controller result to the public PersonDetails shape
    return firstValueFrom(
      controller.getPerson(args).pipe(
        map((x) => {
          // Controller result uses azureUniqueId; remap to azureId and cast to the public PersonDetails shape.
          return { ...x, azureId: x.azureUniqueId } as unknown as PersonDetails;
        }),
      ),
    );
  },
  getInfo(args) {
    // Remap the controller result to the public PersonInfo shape
    return firstValueFrom(
      controller.getPersonInfo(args).pipe(
        map((x) => {
          // Controller result uses azureUniqueId; remap to azureId and cast to the public PersonInfo shape.
          return { ...x, azureId: x.azureUniqueId } as unknown as PersonInfo;
        }),
      ),
    );
  },
  getPhoto(args) {
    return firstValueFrom(controller.getPhoto(args));
  },
  search(args) {
    // Remap each result's azureUniqueId to azureId and cast to the public PersonInfo shape.
    return firstValueFrom(
      controller.search(args).pipe(
        map((x) => {
          // Remap each result's azureUniqueId to azureId and cast to the public PersonInfo shape.
          const mapped = x.map((x) => {
            // Controller result uses azureUniqueId; remap to azureId and cast to the public PersonInfo shape.
            return {
              ...x,
              azureId: x.azureUniqueId,
            } as unknown as PersonInfo;
          });
          return mapped;
        }),
      ),
    );
  },
  suggest(args) {
    return firstValueFrom(controller.suggest(args));
  },
  resolve(args) {
    return firstValueFrom(controller.resolve(args));
  },
});

export default createResolver;
