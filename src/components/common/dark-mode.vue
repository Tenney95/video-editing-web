<script setup lang="ts">
import { useThemeStore } from '@/store/modules/theme';
import { NTabs, NTab } from 'naive-ui';
import { Icon } from '@iconify/vue'

defineOptions({
  name: 'DarkMode'
});
const themeSchemaRecord = {
  light: 'theme.themeSchema.light',
  dark: 'theme.themeSchema.dark',
  auto: 'theme.themeSchema.auto'
};

const themeStore = useThemeStore();

const icons: Record<UnionKey.ThemeScheme, string> = {
  light: 'material-symbols:sunny',
  dark: 'material-symbols:nightlight-rounded',
  auto: 'material-symbols:hdr-auto'
};

function handleSegmentChange(value: string | number) {
  themeStore.setThemeScheme(value as UnionKey.ThemeScheme);
}
</script>

<template>
  <NTabs :key="themeStore.themeScheme" type="segment" size="small" class="relative w-100px"
    :value="themeStore.themeScheme" @update:value="handleSegmentChange">
    <NTab v-for="(_, key) in themeSchemaRecord" :key="key" :name="key">
      <Icon :icon="icons[key]" class="c-#000" />
    </NTab>
  </NTabs>
</template>
