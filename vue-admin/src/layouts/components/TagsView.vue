<template>
  <div class="tags-view-container">
    <el-scrollbar class="tags-view-wrapper">
      <router-link
        v-for="tag in tagsStore.visitedViews"
        :key="tag.path"
        :to="{ path: tag.path, query: tag.query, params: tag.params }"
        :class="['tags-view-item', { active: isActive(tag) }]"
        @contextmenu.prevent="openMenu(tag, $event)"
      >
        {{ tag.title }}
        <el-icon v-if="!tag.meta?.affix" class="close-icon" @click.prevent.stop="closeTag(tag)">
          <Close />
        </el-icon>
      </router-link>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTagsStore, type TagView } from '@/stores/tags';

const route = useRoute();
const router = useRouter();
const tagsStore = useTagsStore();

function isActive(tag: TagView): boolean {
  return tag.path === route.path;
}

function closeTag(tag: TagView) {
  tagsStore.delView(tag);
  if (isActive(tag)) {
    const lastView = tagsStore.visitedViews[tagsStore.visitedViews.length - 1];
    if (lastView) {
      router.push(lastView.fullPath || lastView.path);
    } else {
      router.push('/');
    }
  }
}

function openMenu(_tag: TagView, _e: MouseEvent) {
  // 右键菜单功能可扩展
}

watch(
  () => route.path,
  () => {
    tagsStore.addView(route);
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
.tags-view-container {
  height: 34px;
  background: #fff;
  border-bottom: 1px solid #d8dce5;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12);
}

.tags-view-wrapper {
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 10px;
}

.tags-view-item {
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 10px;
  margin-right: 5px;
  font-size: 12px;
  color: #495060;
  background: #fff;
  border: 1px solid #d8dce5;
  border-radius: 3px;
  text-decoration: none;
  cursor: pointer;

  &.active {
    color: #fff;
    background-color: #409eff;
    border-color: #409eff;
  }

  .close-icon {
    margin-left: 5px;
    font-size: 12px;
    cursor: pointer;

    &:hover {
      color: #f56c6c;
    }
  }
}
</style>
