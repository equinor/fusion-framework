export { ApiVersion } from '@equinor/fusion-framework-module-services/notification';

export { generateEndpoint } from './generate-endpoint';
export { generateParameters } from './generate-parameters';

export * from './types';

export { deleteNotification as getNotificationById, default } from './client';
