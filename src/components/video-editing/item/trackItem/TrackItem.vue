<template>
  <div class="h-full text-left text-sm top-0 absolute trackItem" :class="[isDragState ? 'z-50 isDrag' : 'z-10']"
    :style="[itemClass]" :data-type="props.trackItem.type" :data-line="lineIndex" :data-index="itemIndex"
    @click="setSelectTract">
    <!-- 操作手柄 -->
    <TrackHandler :isActive="isActive" :lineIndex="lineIndex" :itemIndex="itemIndex" />
    <!-- 容器 -->
    <component :is="componentMap.get(trackItem.type)" :trackItem="trackItem" />
  </div>
</template>

<script setup lang="ts">
import TrackHandler from '@/components/video-editing/item/trackItem/TrackHandler.vue';
import VideoItem from '@/components/video-editing/item/trackItem/template/VideoItem.vue';
import AudioItem from '@/components/video-editing/item/trackItem/template/AudioItem.vue';
import TextItem from '@/components/video-editing/item/trackItem/template/TextItem.vue';
import ImageItem from '@/components/video-editing/item/trackItem/template/ImageItem.vue';
import EffectItem from '@/components/video-editing/item/trackItem/template/EffectItem.vue';
import TransitionItem from '@/components/video-editing/item/trackItem/template/TransitionItem.vue';
import FilterItem from '@/components/video-editing/item/trackItem/template/FilterItem.vue';
import { useTrackState } from '@/store/modules/videoediting/trackState';
import { computed } from 'vue';
const props = defineProps({
  trackType: {
    type: String,
    default: ''
  },
  lineIndex: {
    type: Number,
    default: 0
  },
  itemIndex: {
    type: Number,
    default: 0
  },
  trackItem: {
    type: Object as () => VideoEditing.BaseTrackItem,
    default() {
      return {
        width: '0px',
        left: '0px'
      };
    }
  }
});

const store = useTrackState();
const isActive = computed(() => {
  return store.selectTrackItem.line === props.lineIndex && store.selectTrackItem.index === props.itemIndex;
});
const componentMap = new Map<string, any>([
  ['video', VideoItem],
  ['audio', AudioItem],
  ['text', TextItem],
  ['image', ImageItem],
  ['effect', EffectItem],
  ['transition', TransitionItem],
  ['filter', FilterItem]
]);
const isDragState = computed(() => {
  return store.moveTrackData.lineIndex === props.lineIndex && store.moveTrackData.itemIndex === props.itemIndex;
});

/**
 * 设置选中的轨迹项
 * 
 * 此函数用于在用户点击或选择某个轨迹项时，记录该轨迹项的位置信息
 * 它会阻止默认事件行为，以避免触发父组件的事件处理程序
 * 
 * @param {Event} event - 触发的事件对象
 */
function setSelectTract(event: Event) {
  event.preventDefault();
  event.stopPropagation();
  // 记录选中轨迹项的行索引
  store.selectTrackItem.line = props.lineIndex;
  // 记录选中轨迹项的索引
  store.selectTrackItem.index = props.itemIndex;
}

const itemClass = computed(() => {
  if (isDragState.value) {
    return {
      width: props.trackItem.showWidth,
      left: `${parseInt(props.trackItem.showLeft || '0') + store.dragData.moveX}px`,
      top: `${store.dragData.moveY}px`
    };
  }
  return {
    width: props.trackItem.showWidth,
    left: props.trackItem.showLeft
  };
});
</script>