<template>
  <span class="post-tag">
    <router-link :to="{ path: `/tags.html#${tag}`}">
      #{{ tag }}
    </router-link>
  </span>
</template>

<script>
export default {
  name: 'PostTag',
  props: {
    tag: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped lang="stylus">
.post-tag
  a
    padding: .25rem .5rem
    border-radius: .25rem
    background-color: $accentColor
    color: #fff
    font-size: .8rem
    text-decoration: none !important

    &:hover
      background-color: darken($accentColor, 10%)
</style>