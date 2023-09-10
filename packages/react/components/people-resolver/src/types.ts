import type { ApiResponse as PersonDetailApiResponse } from '@equinor/fusion-framework-module-services/people/get';

export type ApiPerson = PersonDetailApiResponse<
    'v4',
    { azureId: ''; expand: ['positions', 'manager'] }
>;
