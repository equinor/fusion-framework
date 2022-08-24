<template>
  <main class="page">
    <slot name="top" />
      <div class="theme-default-content">
        <h1>{{$page.frontmatter.title}}</h1>
        <div class="frontmatter-tags">
          <div class="frontmatter-tags__items">
            <PostTag v-for="tag in $page.frontmatter.tags" :tag="tag" :key="tag" />
          </div>
        </div>
        <Content />
      </div>
    </Content>
    <PageEdit />

    <PageNav v-bind="{ sidebarItems }" />

    <slot name="bottom" />
  </main>
</template>

<script>
  import PageEdit from "@parent-theme/components/PageEdit.vue";
  import PageNav from "@parent-theme/components/PageNav.vue";
  import PostTag from './PostTag'

  export default {
    name: 'Page',
    components: { PageEdit, PageNav, PostTag },
    props: ["sidebarItems"]
  };
</script>

<style scoped lang="stylus">
.frontmatter-tags
  display: flex;
  align-items: center;
  gap: .5rem;
  margin: 1rem 0;
  &__header {
    margin: .5rem 0;
    font-size: 0.8rem;
    font-weight: bold;
  }
  &__items {
    display: flex;
    gap: .5rem
  }
</style>