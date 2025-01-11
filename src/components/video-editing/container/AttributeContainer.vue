<template>
  <div class="select-none relative" :style="attrWidth">
    <SplitLine class="top-0 left-0 bottom-0" direction="vertical" :limitSize="limitSize"
      v-model:newWidth="pageStore.attrWidth" />
    <div v-show="selectTrackOptionsConfig.length === 0" class="w-full h-full">
      <div class="p-2 mt-4">
        <NSkeleton text :repeat="2" :sharp="false" />
        <NSkeleton text :sharp="false" style="width: 20%" />
        <NSkeleton text :repeat="5" :sharp="false" />
        <NSkeleton text :sharp="false" style="width: 60%" />
        <NSkeleton text :repeat="3" :sharp="false" />
        <NSkeleton text :sharp="false" style="width: 30%" />
      </div>
    </div>
    <div class="absolute top-0 left-3 right-2 bottom-0 overflow-hidden">
      <AttrContainer :attrData="selectTrackOptionsConfig" :trackId="trackStore.selectResource?.id" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import { NSkeleton } from 'naive-ui';
import AttrContainer from '@/components/video-editing/item/formItem/AttrContainer.vue';
import { useTrackState } from '@/store/modules/videoediting/trackState';
import SplitLine from '@/components/video-editing/SplitLine.vue';
import { usePageState } from '@/store/modules/videoediting/pageState';

const pageStore = usePageState();
const trackStore = useTrackState();

const TrackOptionsConfig: Record<string, any> = {};
// 将data下的配置导入
const attributeFiles = import.meta.glob('@/data/options/*.ts', { eager: true });
for (const path in attributeFiles) {
  const name = path.match(/(?<=\/)(\w+)(?=\.ts)/) || [];
  if (name[0]) {
    TrackOptionsConfig[name[0]] = (attributeFiles[path] as { Options: Record<string, any> }).Options;
  }
}

const selectTrackOptionsConfig = computed(() => {
  const optionsConfig = trackStore.selectResource && TrackOptionsConfig[trackStore.selectResource.type];
  return optionsConfig ? optionsConfig.attributes : [];
});

const attrWidth = computed(() => ({
  width: `${pageStore.attrWidth}px`
}));

const limitSize = reactive({
  minWidth: 4,
  maxWidth: 600
});
</script>
