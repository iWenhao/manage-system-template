import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStore = defineStore('app', () => {
  const sidebar = ref({
    opened: localStorage.getItem('sidebarStatus') ? !!Number(localStorage.getItem('sidebarStatus')) : true,
    withoutAnimation: false,
  });

  const theme = ref(localStorage.getItem('theme') || 'light');
  const primaryColor = localStorage.getItem('primaryColor') || '#409eff';
  const layout = ref(localStorage.getItem('layout') || 'left');
  const showTagsView = ref(localStorage.getItem('showTagsView') !== 'false');
  const showLogo = ref(localStorage.getItem('showLogo') !== 'false');

  function toggleSidebar() {
    sidebar.value.opened = !sidebar.value.opened;
    sidebar.value.withoutAnimation = false;
    localStorage.setItem('sidebarStatus', sidebar.value.opened ? '1' : '0');
  }

  function closeSidebar(withoutAnimation: boolean) {
    sidebar.value.opened = false;
    sidebar.value.withoutAnimation = withoutAnimation;
    localStorage.setItem('sidebarStatus', '0');
  }

  function setTheme(val: string) {
    theme.value = val;
    localStorage.setItem('theme', val);
    document.documentElement.classList.toggle('dark', val === 'dark');
  }

  function setPrimaryColor(color: string) {
    localStorage.setItem('primaryColor', color);
    document.documentElement.style.setProperty('--el-color-primary', color);
  }

  function setLayout(val: string) {
    layout.value = val;
    localStorage.setItem('layout', val);
  }

  return {
    sidebar,
    theme,
    primaryColor,
    layout,
    showTagsView,
    showLogo,
    toggleSidebar,
    closeSidebar,
    setTheme,
    setPrimaryColor,
    setLayout,
  };
});
