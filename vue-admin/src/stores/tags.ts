import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { RouteLocationNormalized } from 'vue-router';

export interface TagView {
  path: string;
  fullPath?: string;
  name?: string;
  title?: string;
  meta?: any;
  query?: any;
  params?: any;
}

export const useTagsStore = defineStore('tags', () => {
  const visitedViews = ref<TagView[]>([]);
  const cachedViews = ref<string[]>([]);

  function addView(view: RouteLocationNormalized) {
    addVisitedView(view);
    addCachedView(view);
  }

  function addVisitedView(view: RouteLocationNormalized) {
    if (visitedViews.value.some((v) => v.path === view.path)) return;
    visitedViews.value.push({
      path: view.path,
      fullPath: view.fullPath,
      name: view.name as string,
      title: view.meta?.title as string,
      meta: view.meta,
      query: view.query,
      params: view.params,
    });
  }

  function addCachedView(view: RouteLocationNormalized) {
    const name = view.name as string;
    if (!name) return;
    if (cachedViews.value.includes(name)) return;
    if (!view.meta?.noCache) {
      cachedViews.value.push(name);
    }
  }

  function delView(view: TagView) {
    const index = visitedViews.value.findIndex((v) => v.path === view.path);
    if (index > -1) {
      visitedViews.value.splice(index, 1);
    }
    const cacheIndex = cachedViews.value.indexOf(view.name || '');
    if (cacheIndex > -1) {
      cachedViews.value.splice(cacheIndex, 1);
    }
  }

  function delOtherViews(view: TagView) {
    visitedViews.value = visitedViews.value.filter((v) => v.meta?.affix || v.path === view.path);
    cachedViews.value = cachedViews.value.filter((name) => name === view.name);
  }

  function delAllViews() {
    visitedViews.value = visitedViews.value.filter((v) => v.meta?.affix);
    cachedViews.value = [];
  }

  return {
    visitedViews,
    cachedViews,
    addView,
    addVisitedView,
    addCachedView,
    delView,
    delOtherViews,
    delAllViews,
  };
});
