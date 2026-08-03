import type { FieldFakerMap } from '../../src/types';

export default {
  'User.email': 'internet.email',
  'User.id': ({ modelName, path }) => `${modelName}:${path.join('.')}`,
} satisfies FieldFakerMap;
