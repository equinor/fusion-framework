import { createOpenApiMock } from '@equinor/fusion-openapi-mock';
import openapi from './openapi.json' with { type: 'json' };
import fields from './fields.faker';
import { productCategories, generateProduct, generateProducts, generateUser, generateUsers } from './generators';

/**
 * Fakes the cookbook's products/users endpoints straight from {@link ./openapi.json}, so a test
 * exercises the real `clientLoader`/`ProductApi`/`UserApi` request pipeline against realistic,
 * deterministically seeded data instead of the router's error boundary.
 *
 * @remarks
 * Every operation is overridden with the same seeded generators `dev-server.config.ts` uses,
 * because the two list endpoints need real pagination/identity behavior a static per-operation
 * schema fake can't express — the OpenAPI document and {@link ./fields.faker.ts} sidecar still
 * describe the real contract, and would fake a plausible baseline for any operation left
 * un-overridden.
 */
export const apiMock = createOpenApiMock(openapi, { seed: 42, fields });

apiMock.register('listProducts', async () => ({
  status: 200,
  mock: { products: generateProducts() },
}));

apiMock.register('getProductById', async ({ params }) => ({
  status: 200,
  mock: generateProduct(parseInt(params.id, 10)),
}));

apiMock.register('listCategories', async () => ({
  status: 200,
  mock: { categories: productCategories },
}));

apiMock.register('listUsers', async ({ query }) => {
  const page = parseInt(query.page || '1', 10);
  const limit = parseInt(query.limit || '5', 10);

  const allUsers = generateUsers();
  const startIndex = (page - 1) * limit;
  const users = allUsers.slice(startIndex, startIndex + limit);
  const totalPages = Math.ceil(allUsers.length / limit);

  return {
    status: 200,
    mock: {
      users,
      page,
      limit,
      total: allUsers.length,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
});

apiMock.register('getUserById', async ({ params }) => ({
  status: 200,
  mock: generateUser(parseInt(params.id, 10)),
}));

export default apiMock;
