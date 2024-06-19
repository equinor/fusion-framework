import buildODataQuery from 'odata-query';

console.log(
  buildODataQuery({
    filter: {
      name: 'John',
      age: 25,
    },
  }),
);
