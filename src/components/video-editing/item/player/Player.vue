<template>
  <div class="w-full h-full absolute top-0 bottom-0 left-0 right-0">
    <canvas ref="playerCanvas" class="absolute left-0 right-0 top-0 bottom-0 m-auto bg-gray-900" id="player"
      :style="{ zoom: scale, width: `${playerWidth}px`, height: `${playerHeight}px` }" />

    <PlayerMoveable :style="{ zoom: scale, width: `${playerWidth}px`, height: `${playerHeight}px` }" />
  </div>
  <PlayerControl />
</template>

<script setup lang="ts">
import PlayerMoveable from '@/components/video-editing/item/player/PlayerMoveable.vue';
import PlayerControl from '@/components/video-editing/item/player/PlayerControl.vue';
import { ref, computed } from 'vue';
import { usePlayerState } from '@/store/modules/videoediting/playerState';
import { CanvasPlayer } from '@/components/video-editing/item/player/canvasDraw';
import { storeToRefs } from 'pinia';
const props = defineProps({
  /* 容器大小 */
  containerSize: {
    type: Object,
    default() {
      return {
        width: 0,
        height: 0
      };
    }
  }
});
const store = usePlayerState();
const playerCanvas = ref();

new CanvasPlayer({
  player: playerCanvas,
  containerSize: props.containerSize
});

const { playerWidth, playerHeight } = storeToRefs(store);

const scale = computed(() => {
  let { width, height } = props.containerSize;
  height -= 96; // 上下功能栏
  width -= 16; // 左右功能栏
  return Math.min(width / playerWidth.value, height / playerHeight.value);
});
</script>