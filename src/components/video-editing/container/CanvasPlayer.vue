<template>
  <div class="w-full h-full flex-1 overflow-hidden relative" ref="playerContent" @click="cancelSelect">
    <Player :containerSize="containerSize" />
  </div>
</template>

<script setup lang="ts">
import Player from '@/components/video-editing/item/player/Player.vue';
import { usePlayerState } from '@/store/modules/videoediting/playerState';
import { usePageState } from '@/store/modules/videoediting/pageState';
import { watch, ref, onMounted, reactive } from 'vue';
import { useTrackState } from '@/store/modules/videoediting/trackState';
const pageStore = usePageState();
const store = usePlayerState();
const trackStore = useTrackState();
const playerContent = ref();
const containerSize = reactive({
  width: 0,
  height: 0
});
function cancelSelect(event: MouseEvent) {
  event.stopPropagation();
  trackStore.selectTrackItem.line = -1;
  trackStore.selectTrackItem.index = -1;
}
// 更新画布尺寸
function updateContainerSize() {
  if (!playerContent.value) return;
  let { width: maxW, height: maxH } = playerContent.value.getBoundingClientRect();
  containerSize.width = maxW;
  containerSize.height = maxH;
}
onMounted(() => {
  updateContainerSize();
});
window.addEventListener('resize', updateContainerSize, false);

watch(() => pageStore.trackHeight, () => {
  updateContainerSize();
}, { flush: 'post' });

watch([() => store.playerHeight, () => store.playerWidth], () => {
  updateContainerSize();
}, {
  flush: 'post'
});
</script>
