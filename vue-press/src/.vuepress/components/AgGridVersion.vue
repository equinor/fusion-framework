<template>
  <strong>{{version}}</strong>
</template>

<script>
import agGridModule from '../../../../packages/modules/ag-grid/package.json';
export default {
  name: 'AgGridVersion',
  computed: {
    version() {
      return agGridModule.dependencies['@ag-grid-enterprise/core'].slice(1);
    }
  }
};
</script>
