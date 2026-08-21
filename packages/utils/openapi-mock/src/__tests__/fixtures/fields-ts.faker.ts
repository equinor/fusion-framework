import type { FieldFakerContext, FieldFakerMap } from '../../types.js';

export default {
  'User.email': 'internet.email',
  'User.id': ({ modelName, path }: FieldFakerContext) => `${modelName}:${path.join('.')}`,
} satisfies FieldFakerMap;
