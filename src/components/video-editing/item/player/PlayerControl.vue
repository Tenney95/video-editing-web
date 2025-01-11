<template>
  <div
    class="flex items-center justify-between absolute bottom-0 left-0 right-0 pl-2 pr-2 h-8 border-t dark:border-darker border-gray-300">
    <div class="w-180px h-full text-xs leading-8">
      <span class="text-blue-400 mr-1 w-20 inline-block">
        {{ playTime }}</span>/<span class="ml-2 w-20">{{ allTime }}
      </span>
    </div>
    <div class="flex items-center font-size-24px">
      <icon-material-symbols:play-arrow-rounded v-show="store.isPause" @click="startPlay"
        class="cursor-pointer box-content" />
      <icon-material-symbols:pause-rounded v-show="!store.isPause" @click="pauseVideo"
        class="cursor-pointer box-content" />
    </div>
    <div class="w-180px flex justify-end">
      <NTag class="hover:c-indigo" size="small" @click="showModal = true"> {{ store.playerWidth + 'X' +
        store.playerHeight
        }} </NTag>
    </div>
  </div>
  <NModal v-model:show="showModal" size="small">
    <NCard class="w-260px">
      <NForm size="small">
        <NFormItem label="尺寸">
          <NInputNumber v-model:value="store.playerWidth" :show-button="false" />
          <NInputNumber class="ml" v-model:value="store.playerHeight" :show-button="false" />
        </NFormItem>
      </NForm>
    </NCard>
  </NModal>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { NCard, NTag, NModal, NForm, NFormItem, NInputNumber } from 'naive-ui';
import { formatPlayerTime, preciseInterval } from '@/utils/common';
import { usePlayerState } from '@/store/modules/videoediting/playerState';
import { useTrackState } from '@/store/modules/videoediting/trackState';
import { getCurrentTrackItemList, isOfCanPlayType } from '@/utils/videoediting/trackUtils';
const props = defineProps({
  disable: {
    type: Boolean,
    default: false
  }
});
const store = usePlayerState();
const trackStore = useTrackState();
const showModal = ref(false);
const playTime = computed(() => {
  return formatPlayerTime(store.playStartFrame);
});
const allTime = computed(() => {
  return formatPlayerTime(trackStore.frameCount);
});

let playTimer = ref();
const timeStamp = 1000 / 30;
// 视频暂停
const pauseVideo = () => {
  if (props.disable) return;
  store.isPause = true;
  playTimer.value?.cancel();

  const trackItemList = getCurrentTrackItemList(trackStore.trackList, store.playStartFrame, isOfCanPlayType);
  trackItemList.forEach(item => {
    item?.pause();
  });
};

// 视频播放
function startPlay() {
  if (props.disable) return;
  if (store.playStartFrame >= trackStore.frameCount) {
    store.playStartFrame = 0;
  }
  store.isPause = false;
  playTimer.value?.cancel();
  playTimer.value = preciseInterval(() => {
    store.playStartFrame++;
    if (store.playStartFrame === trackStore.frameCount) {
      pauseVideo();
    }
  }, timeStamp);

  console.log(trackStore);
}

// 添加空格键监听
const handleSpacebar = (event: KeyboardEvent) => {
  if (event.code === 'Space') {
    event.preventDefault(); // 阻止空格键滚动
    if (store.isPause) {
      startPlay();
    } else {
      pauseVideo();
    }
  }
};
onMounted(() => {
  window.addEventListener('keydown', handleSpacebar);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleSpacebar);
});

// 在一些操作时，需要暂停播放
watch(() => store.isPause, () => {
  if (store.isPause) {
    pauseVideo();
  }
});

watch(() => store.playStartFrame, () => {
  if (!store.isPause) {
    // 播放声音，查询当前帧的数据
    const trackItemList = getCurrentTrackItemList(trackStore.trackList, store.playStartFrame, isOfCanPlayType);

    trackItemList.forEach(item => {
      item?.play(store.playStartFrame);
    });
  }
});
</script>

<style scoped></style>