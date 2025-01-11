import { ref, watchEffect } from 'vue';
import { defineStore } from 'pinia';

export const usePageState = defineStore('pageState', () => {
  const pageTitle = ref('web视频编辑');
  const isLoading = ref(localStorage.loadingPage === '1');
  const hideSubMenu = ref(localStorage.showSubmenu === '0');
  watchEffect(() => {
    localStorage.loadingPage = isLoading.value ? '1' : '0';
    localStorage.hideSubMenu = hideSubMenu.value ? '1' : '0';
  });

  // 属性宽度
  const attrWidth = ref(parseInt(localStorage.attrW || '320'));
  // 轨道高度
  const trackHeight = ref(parseInt(localStorage.trackH || '380'));
  watchEffect(() => {
    localStorage.attrW = attrWidth.value;
    localStorage.trackH = trackHeight.value;
  });

  return {
    hideSubMenu,
    isLoading,
    pageTitle,
    attrWidth,
    trackHeight
  };
});
