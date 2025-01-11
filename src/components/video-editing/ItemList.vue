<template>
  <div class="flex flex-col transition-all duration-200 overflow-x-hidden dark:border-r-2 border-r border-#222"
    :class="collapse ? 'w-0' : 'w-100%'">
    <div class="min-h-full flex flex-col overflow-hidden">
      <div class="h-20px flex items-center justify-between">
        <span class="inline leading-10 pl-3 select-none">{{ title }}</span>
        <i class="iconfont icon-shuangjiantou_zuo_line" @click="switchCollapse" />
      </div>
      <LocalPanel v-if="activeKey === 'local'" />
      <ImagePanel v-if="activeKey === 'image'" />
      <VideoPanel v-if="activeKey === 'video'" />
      <AudioPanel v-if="activeKey === 'audio'" />
      <TextPanel v-if="activeKey === 'text'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import LocalPanel from './LocalPanel/index.vue';
import ImagePanel from './ImagePanel/index.vue';
import VideoPanel from './VideoPanel/index.vue';
import AudioPanel from './AudioPanel/index.vue';
import TextPanel from './TextPanel/index.vue';


const props = defineProps({
  activeKey: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  defaultCollapse: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits({
  collapseChange(newCollapse: boolean) {
    return newCollapse !== null;
  }
});

const title = computed(() => props.title);
const collapse = ref(props.defaultCollapse);
function switchCollapse() {
  collapse.value = !collapse.value;
}


watch(collapse, newValue => {
  emit('collapseChange', newValue);
});
watch(() => props.defaultCollapse, newValue => {
  collapse.value = newValue;
});
</script>