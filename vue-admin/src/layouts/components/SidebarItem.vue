<template>
  <template v-if="!item.meta?.hidden">
    <!-- 只有一个子菜单或没有子菜单 -->
    <template v-if="hasOneShowingChild(item)">
      <el-menu-item :index="onlyChild.path">
        <el-icon v-if="onlyChild.meta?.icon"><component :is="onlyChild.meta.icon" /></el-icon>
        <template #title>{{ onlyChild.meta?.title }}</template>
      </el-menu-item>
    </template>

    <!-- 多个子菜单 -->
    <el-sub-menu v-else :index="item.path">
      <template #title>
        <el-icon v-if="item.meta?.icon"><component :is="item.meta.icon" /></el-icon>
        <span>{{ item.meta?.title }}</span>
      </template>
      <sidebar-item
        v-for="child in item.children"
        :key="child.path"
        :item="child"
        :base-path="getFullPath(child.path)"
      />
    </el-sub-menu>
  </template>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  basePath: {
    type: String,
    default: '',
  },
});

const onlyChild = ref<any>({});

function hasOneShowingChild(item: any): boolean {
  const children = item.children?.filter((c: any) => !c.meta?.hidden) || [];
  if (children.length === 1) {
    onlyChild.value = children[0];
    return true;
  }
  if (children.length === 0) {
    onlyChild.value = { ...item };
    return true;
  }
  return false;
}

function getFullPath(childPath: string): string {
  if (childPath.startsWith('/')) return childPath;
  return `${props.basePath}/${childPath}`.replace(/\/+/g, '/');
}
</script>
