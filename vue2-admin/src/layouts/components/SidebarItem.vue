<template>
  <div v-if="!item.meta || !item.meta.hidden">
    <!-- 只有一个子菜单或没有子菜单 -->
    <template v-if="hasOneShowingChild(item)">
      <el-menu-item :index="onlyChild.path">
        <i v-if="onlyChild.meta && onlyChild.meta.icon" :class="onlyChild.meta.icon"></i>
        <span slot="title">{{ onlyChild.meta && onlyChild.meta.title }}</span>
      </el-menu-item>
    </template>

    <!-- 多个子菜单 -->
    <el-submenu v-else :index="item.path">
      <template slot="title">
        <i v-if="item.meta && item.meta.icon" :class="item.meta.icon"></i>
        <span>{{ item.meta && item.meta.title }}</span>
      </template>
      <sidebar-item
        v-for="child in item.children"
        :key="child.path"
        :item="child"
        :base-path="getFullPath(child.path)"
      />
    </el-submenu>
  </div>
</template>

<script>
export default {
  name: 'SidebarItem',
  props: {
    item: {
      type: Object,
      required: true,
    },
    basePath: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      onlyChild: {},
    }
  },
  methods: {
    hasOneShowingChild(item) {
      const children = (item.children || []).filter(c => !c.meta || !c.meta.hidden)
      if (children.length === 1) {
        this.onlyChild = children[0]
        return true
      }
      if (children.length === 0) {
        this.onlyChild = { ...item }
        return true
      }
      return false
    },
    getFullPath(childPath) {
      if (childPath.startsWith('/')) return childPath
      return `${this.basePath}/${childPath}`.replace(/\/+/g, '/')
    },
  },
}
</script>
