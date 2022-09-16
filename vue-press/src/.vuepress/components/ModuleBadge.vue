<template>
  <a :href="npmUrl" target="npm">
    <img 
      alt="GitHub package.json version (subfolder of monorepo)" 
      :src="url" />
  </a>
</template>

<script>
export default {
  name: 'ModuleBadge',
  props: {
    repo: {
      type: String,
    },
    module: {
      type: String,
      required: true
    },
     package: {
      type: String,
    },
    layout: {
      type: String,
      default: 'for-the-badge'
    },
    label: {
      type: String
    }
  },
  computed: {
    url() {
      const url = new URL(`https://img.shields.io/github/package-json/v/equinor/fusion-framework`);
      url.searchParams.set('filename',  `packages/${this.module}/package.json`);
      url.searchParams.set('style', this.layout);
      url.searchParams.set('label', this.label || this.packageName);
      return url.toString();
    },
    packageName() {
      return this.package || `@equinor/fusion-framework-${this.module}`;
    },
    npmUrl() {
      return `https://www.npmjs.com/package/${this.packageName}`;
    }
  }
};
</script>
