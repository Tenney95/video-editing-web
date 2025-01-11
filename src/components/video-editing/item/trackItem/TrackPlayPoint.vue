<template>
  <div class="z-30 w-px absolute -top-5 bottom-0 bg-gray-700 dark:bg-gray-100 transition-transform duration-75"
    id="trackPlayPoint" :style="trackStyle" @mousedown="onMouseDown">
    <div class="h-5 w-4 cursor-move transform -translate-x-1/2">
      <svg fill="none" version="1.1" width="100%" height="100%" viewBox="0 0 10 16">
        <g>
          <path
            d="M0,1L0,11.5194C0,11.8232,0.13809,12.1105,0.375305,12.3002L4.37531,15.5002C4.74052,15.7924,5.25948,15.7924,5.6247,15.5002L9.62469,12.3002C9.86191,12.1105,10,11.8232,10,11.5194L10,1C10,0.447715,9.55229,0,9,0L1,0C0.447715,0,0,0.447715,0,1Z"
            fill="#646CFF" fill-opacity="1" />
        </g>
      </svg>
    </div>

  </div>
</template>

<script setup lang="ts">
// 播放点，游标
import { getGridPixel, getSelectFrame } from '@/utils/videoediting/canvasUtil';
import { computed, ref } from 'vue';
import { useTrackState } from '@/store/modules/videoediting/trackState';
import { usePlayerState } from '@/store/modules/videoediting/playerState';
const offsetLine = {
  left: 10
};

const trackStore = useTrackState();
const playerStore = usePlayerState();
const trackStyle = computed(() => {
  return {
    left: `${offsetLine.left}px`,
    transform: `translate(${getGridPixel(trackStore.trackScale, playerStore.playStartFrame)}px, 0px)`
  };
});

const isDragging = ref(false);

function onMouseDown(event: MouseEvent) {
  event.stopPropagation();
  event.preventDefault();
  playerStore.isPause = true;
  isDragging.value = true;
}

function onMouseMove(event: MouseEvent) {
  if (isDragging.value) {
    // 获取相对于#timeline的偏移量
    const rect = document.getElementById('track-container')?.getBoundingClientRect() || { left: 0 };
    // 默认fps为30
    const frame = getSelectFrame(event.pageX - offsetLine.left - rect.left, trackStore.trackScale, 30);

    const playFrame = frame - 1;
    const startFrame = playFrame < 0 ? 0 : playFrame > trackStore.frameCount ? trackStore.frameCount : playFrame;
    playerStore.playStartFrame = startFrame;
  }
}

document.addEventListener('mousemove', onMouseMove);

function onMouseUp() {
  isDragging.value = false;
}

document.addEventListener('mouseup', onMouseUp);
</script>

<style scoped>
.playPoint {
  transform: translateX(-50%);
}

/* .playPoint::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: -60%;
  transform: translateX(-50%);
  border-left: 6.5px solid transparent;
  border-right: 6.5px solid transparent;
  border-top: 8px solid #646cff;
} */
</style>