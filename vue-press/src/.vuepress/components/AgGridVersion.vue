<template>
  <strong>{{version}}</strong>
</template>

<script>
import agGridModule from '../../../../packages/modules/ag-grid/package.json';
export default {
  name: 'AgGridVersion',
  computed: {
    version() {
      return agGridModule.devDependencies['ag-grid-enterprise'].slice(1);
    },
  },
};
</script>
