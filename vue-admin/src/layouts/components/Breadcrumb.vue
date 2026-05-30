<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="item.path">
      <span v-if="index === breadcrumbs.length - 1">{{ item.meta?.title }}</span>
      <router-link v-else :to="item.path">{{ item.meta?.title }}</router-link>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const breadcrumbs = ref<any[]>([]);

function getBreadcrumbs() {
  const matched = route.matched.filter((item) => item.meta?.title);
  breadcrumbs.value = [{ path: '/', meta: { title: '首页' } }, ...matched];
}

watch(() => route.path, getBreadcrumbs, { immediate: true });
</script>
