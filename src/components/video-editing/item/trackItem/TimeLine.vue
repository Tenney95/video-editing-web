<template>
  <div ref="canvasContainer" class="sticky top-0 left-0 right-0 h-5 text-center leading-5 text-sm z-20">
    <canvas :style="canvasStyle" v-bind="canvasAttr" ref="timeLine" @click="handleClick" />
  </div>
</template>

<script setup lang="ts">
import { usePageState } from '@/store/modules/videoediting/pageState';
import { drawTimeLine, getSelectFrame } from '@/utils/videoediting/canvasUtil';
import type { UserConfig, CanvasConfig } from '@/utils/videoediting/canvasUtil';
import { ref, computed, onMounted, nextTick, watch, reactive, toRefs } from 'vue';
const props = defineProps({
  start: { // 开始坐标
    type: Number,
    default: 0
  },
  step: { // 步进，与视频fps同步
    type: Number,
    default: 30
  },
  scale: { // 时间轴缩放比例
    type: Number,
    default: 0
  },
});
const emits = defineEmits({
  selectFrame(val: number) {
    return val !== null;
  }
});
/**
 * 初始化 Canvas
 * */
const canvasContainer = ref();
const timeLine = ref();
let canvasContext = {} as CanvasRenderingContext2D;
const { hideSubMenu } = toRefs(usePageState());
const canvasConfigs = computed(() => ({
  bgColor: '#374151', // 背景颜色
  ratio: window.devicePixelRatio || 1, // 设备像素比
  textSize: 12, // 字号
  textScale: 0.83, // 支持更小号字： 10 / 12
  lineWidth: 1, // 线宽
  textBaseline: 'middle', // 文字对齐基线 (ts 中定义的textBaseLine是一个联合类型)
  textAlign: 'center', // 文字对齐方式
  longColor: '#E5E7EB', // 长线段颜色
  shortColor: '#9CA3AF', // 短线段颜色
  textColor: '#E5E7EB', // 文字颜色
  subTextColor: '#9CA3AF', // 小文字颜色
  focusColor: '#6D28D9'
}));
const canvasAttr = reactive({
  width: 0,
  height: 0
});
const canvasStyle = computed(() => {
  return {
    width: `${canvasAttr.width / canvasConfigs.value.ratio}px`,
    height: `${canvasAttr.height / canvasConfigs.value.ratio}px`
  };
});
// 重绘线条
function updateTimeLine() {
  drawTimeLine(canvasContext, { ...props } as UserConfig, { ...canvasAttr, ...canvasConfigs.value } as CanvasConfig);
}
// 设置 canvas 上下文环境
function setCanvasContext() {
  canvasContext = timeLine.value.getContext('2d');
  canvasContext.font = `${canvasConfigs.value.textSize * canvasConfigs.value.ratio}px -apple-system, ".SFNSText-Regular", "SF UI Text", "PingFang SC", "Hiragino Sans GB", "Helvetica Neue", "WenQuanYi Zen Hei", "Microsoft YaHei", Arial, sans-serif`;
  canvasContext.lineWidth = canvasConfigs.value.lineWidth;
  canvasContext.textBaseline = canvasConfigs.value.textBaseline as CanvasTextBaseline;
  canvasContext.textAlign = canvasConfigs.value.textAlign as CanvasTextAlign;
}
// 设置 canvas 大小
function setCanvasRect() {
  const { width, height } = canvasContainer.value.getBoundingClientRect();
  canvasAttr.width = width * canvasConfigs.value.ratio;
  canvasAttr.height = height * canvasConfigs.value.ratio;
  nextTick(() => {
    setCanvasContext();
    updateTimeLine();
  });
}
function handleClick(event: MouseEvent) {
  const offset = event.offsetX;
  const frameIndex = getSelectFrame(props.start + offset, props.scale, props.step);
  emits('selectFrame', frameIndex);
}
onMounted(() => {
  setCanvasRect();
});
watch(canvasConfigs, updateTimeLine);
watch(props, updateTimeLine);
watch(hideSubMenu, () => {
  setTimeout(() => {
    setCanvasRect();
  }, 300);
}, {
  flush: 'post'
});
window.addEventListener('resize', setCanvasRect, false);
</script>