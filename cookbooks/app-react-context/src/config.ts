import type { AppModuleInitiator } from '@equinor/fusion-framework-app';
import { enableContext } from '@equinor/fusion-framework-react-module-context';

export const configure: AppModuleInitiator = (configurator) => {
    enableContext(configurator, {
        contextType: ['orgchart'], // set contextType to match against
        /* FIlter result against regex */
        // contextFilter: (result) => {
        //     return result.filter((x) => x.title?.match(/ohan/));
        // },
    });
};

export default configure;
