export default (
  _env: { root: string },
  { base: _base }: { base: { api: { serviceDiscoveryUrl: string } } },
) => ({
  mockServer: {
    path: 'api-mocks',
    port: 4010,
    host: '127.0.0.1',
    seed: 42,
  },
});
