<template lang="html">
  <div>
    Tags:
    <PostTag v-for="tag in $page.frontmatter.tags" :tag="tag" :key="tag" />
    
  </div>
</template>