<script setup lang="ts">
import { computed } from "vue";
import { useThemeStore } from './store/modules/theme';
import AppProvider from '@/components/common/app-provider.vue';
import { NConfigProvider, darkTheme } from 'naive-ui';
import Editor from './views/Editor.vue';

const themeStore = useThemeStore();
const naiveDarkTheme = computed(() => (themeStore.darkMode ? darkTheme : undefined));

</script>

<template>
  <NConfigProvider :theme="naiveDarkTheme" :theme-overrides="themeStore.naiveTheme" class="h-full">
    <AppProvider>
      <Editor />
    </AppProvider>
  </NConfigProvider>
</template>
<style lang="scss">
body {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  color: var(--primary-color);
}

#app {
  height: 100%;
}

/* 定义 CSS 变量 */
:root {
  /* 浅色主题下的文本颜色，使用 Naive UI 的默认文本颜色 */
  --text-color-light: var(--n-text-color);
  /* 深色主题下的文本颜色，使用 Naive UI 的默认文本颜色 */
  --text-color-dark: var(--n-text-color);
  --text-color: var(--text-color-light);
}

/* 当 html 标签具有 .dark 类名时，覆盖深色主题的 CSS 变量 */
html.dark {
  --text-color-dark: var(--n-text-color);
}


/* 初始化 text-color */
body {
  --text-color: var(--text-color-light);
}

/* 当 html 标签具有 .dark 类名时，覆盖text-color */
html.dark body {
  --text-color: var(--text-color-dark);
}

/* 选择需要修改字体颜色的原生标签，例如 p, span, h1-h6, label */
p,
span,
h1,
h2,
h3,
h4,
h5,
h6,
label {
  /* 使用动态的 CSS 变量 text-color 设置颜色 */
  color: var(--text-color);
}

/* 整个滚动条 */
::-webkit-scrollbar {
  width: 10px;
  /* 滚动条宽度 */
  height: 10px;
  /* 滚动条高度，水平滚动时生效 */
}

/* 滚动条轨道 */
::-webkit-scrollbar-track {
  background-color: transparent;
  /* 设置轨道背景为透明 */
}

/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.6);
  /* 设置滑块颜色，也可以设置为透明 */
  border-radius: 4px;
  /* 滑块圆角 */
}

/* 滚动条滑块在鼠标悬停时 */
::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.6);
  /* 设置滑块悬停颜色 */
}
</style>