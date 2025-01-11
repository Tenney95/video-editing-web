import { ref, toRefs, reactive } from 'vue';
import { defineStore } from 'pinia';

export const usePlayerState = defineStore('playerState', () => {
  const ingLoadingCount = ref(0);
  // 产出比率
  const outputRatio = ref(1);
  // 画板信息
  const canvasOptions = reactive({
    width: 0,
    height: 0
  });
  // 要播放的总帧数
  const playerConfig = reactive({
    frameCount: 0,
    playerWidth: 1080 / outputRatio.value,
    playerHeight: 1920 / outputRatio.value
  });
  const existVideo = ref(false);
  const playStartFrame = ref(0); // 当前播放帧
  const playTargetTrackMap = ref(new Map()); // 当前播放的元素集合
  const isPause = ref(true);

  return {
    isPause,
    playStartFrame,
    ingLoadingCount,
    playTargetTrackMap,
    existVideo,
    outputRatio,
    ...toRefs(playerConfig),
    canvasOptions
  };
});
