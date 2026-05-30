<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="item.path">
      <span v-if="index === breadcrumbs.length - 1">{{ item.meta && item.meta.title }}</span>
      <router-link v-else :to="item.path">{{ item.meta && item.meta.title }}</router-link>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script>
export default {
  name: 'Breadcrumb',
  data() {
    return {
      breadcrumbs: [],
    }
  },
  watch: {
    $route: {
      handler() {
        this.getBreadcrumbs()
      },
      immediate: true,
    },
  },
  methods: {
    getBreadcrumbs() {
      const matched = this.$route.matched.filter(item => item.meta && item.meta.title)
      this.breadcrumbs = [{ path: '/', meta: { title: '首页' } }, ...matched]
    },
  },
}
</script>
