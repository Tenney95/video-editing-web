<template>
  <div class="w-full h-full overflow-hidden select-none relative pt-2 flex flex-col" :style="trackHeight">
    <SplitLine class="top-0 left-0 right-0" direction="horizontal" :limitSize="limitSize"
      v-model:newHeight="page.trackHeight" />
    <TrackContro v-model="store.trackScale" />
    <TrackList />
  </div>
</template>

<script setup lang="ts">
import SplitLine from '@/components/video-editing/SplitLine.vue';
import TrackContro from '@/components/video-editing/item/trackItem/TrackContro.vue';
import TrackList from '@/components/video-editing/TrackList.vue';
import { useTrackState } from '@/store/modules/videoediting/trackState';
import { usePageState } from '@/store/modules/videoediting/pageState';
import { computed, reactive } from 'vue';
const page = usePageState();
const store = useTrackState();
const trackHeight = computed(() => ({
  height: `${page.trackHeight}px`
}));
const limitSize = reactive({
  minHeight: 200,
  maxHeight: document.body.getBoundingClientRect().height - 200
});
</script>