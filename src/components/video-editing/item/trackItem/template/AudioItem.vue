<template>
  <div v-if="!isVideo" class="flex flex-col rounded overflow-hidden h-full">
    <div
      class="absolute w-full h-5 flex items-center text-xs overflow-hidden leading-5  bg-blue-600/30 bg-opacity-50 text-gray-100 z-10">
      <div class="pl-2 flex items-center">
        <Icon icon="fad:logo-audiobus" class="inline-block mr-2 shrink-0 font-size-16px" />
        <span class="mr-4 shrink-0">{{ `${trackItem.name}.${trackItem.format}` }}</span>
      </div>

    </div>
    <div :style="waveStyle" class="absolute w-full h-full bg-blue-950" ref="waveRef" />
    <Loading v-show="loading" class="pl-12 bg-opacity-70" />
  </div>
  <div v-else class="absolute bottom-0 left-0 w-full h-25px" :style="waveStyle" ref="waveRef" />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { type PropType } from 'vue';
import { Icon } from '@iconify/vue';
import Loading from '@/components/video-editing/Loading.vue';
import { usePlayerState } from '@/store/modules/videoediting/playerState';
import trackCheckPlaying from './trackCheckPlaying';
import WaveSurfer from 'wavesurfer.js';
import type { WaveSurferOptions } from 'wavesurfer.js';
// import { WaveOptions } from '@/data/trackConfig';

const props = defineProps({
  trackItem: {
    type: Object as PropType<VideoEditing.AudioTrackItem>,
    default() {
      return {
        showWidth: '0px',
        showLeft: '0px'
      };
    }
  },
  isVideo: {
    type: Boolean,
    default: false
  }
});


const store = usePlayerState();
store.ingLoadingCount++;
const loading = ref(true);
const waveRef = ref<HTMLElement>();
const waveStyle = computed(() => {
  const { start, end, offsetL, offsetR, frameCount } = props.trackItem;
  const showFrameCount = end - start;
  return {
    transform: `scaleX(${(frameCount / showFrameCount).toFixed(2)})`,
    transformOrigin: 'left top',
    left: `-${(offsetL ?? start) / showFrameCount * 100}%`,
    right: `-${(offsetR ?? end) / showFrameCount * 100}%`
  };
});


async function initAudio() {
  if (!waveRef.value) return;
  const WaveOptions: WaveSurferOptions = {
    container: waveRef.value,
    url: props.trackItem.source.url,
    height: 'auto',
    width: '100%',
    /* 将每个音频通道渲染为单独的波形 */
    // splitChannels: [{
    //   overlay: false
    // }],
    normalize: true,
    waveColor: '#683CFD',
    /* 光标颜色 */
    progressColor: '#dd5e98',
    cursorColor: '#ddd5e9',
    cursorWidth: 0,
    barWidth: 1,
    barGap: 1,
    barRadius: 1,
    barHeight: 0.6,
    barAlign: 'bottom',
    minPxPerSec: 1,
    fillParent: true,
    /* 是否显示媒体控件 */
    mediaControls: false,
    autoplay: false,
    interact: false,
    dragToSeek: false,
    hideScrollbar: false,
    audioRate: 0.1,
    autoScroll: true,
    autoCenter: true,
    sampleRate: 8000
  };
  WaveSurfer.create(WaveOptions);
  loading.value = false;
  store.ingLoadingCount--;
}

watch(() => {
  return props.trackItem.source && waveRef.value;
}, () => {
  waveRef.value && initAudio();
}, {
  immediate: true
});
trackCheckPlaying(props);
</script>