<template>
  <div ref="iconList"
    class="relative w-5 flex h-full flex-col items-center justify-start overflow-auto dark:border-r-2 dark:border-darker border-gray-300 border-r">
    <div class="w-full h-full flex flex-col justify-center overflow-x-hidden pt-20px">
      <template v-for="lineData of listData" :key="lineData.id">
        <div class="z-10 flex justify-center items-center justify-center w-full text-center mb-1 mt-1"
          :class="[lineData.main ? 'bg-blue-500 bg-opacity-20' : '']" :title="lineData.main ? '主轨道' : ''">
          <Icon :icon="componentMap.get(lineData.type) || ''" class="font-size-16px text-gray-500"
            @click="lineData.main = false" />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps({
  listData: {
    type: Object as () => VideoEditing.ShowTrackList,
    default() {
      return [];
    }
  },
  offsetTop: {
    type: Number,
    default: 0
  }
});

const componentMap = new Map([
  ['video', 'material-symbols:auto-videocam'],
  ['audio', 'fad:logo-audiobus'],
  ['text', 'material-symbols:text-snippet'],
  ['image', 'material-symbols:imagesmode'],
  ['effect', 'fluent:video-background-effect-48-filled'],
  ['transition', 'material-symbols:transition-fade'],
  ['filter', 'material-symbols:movie-filter']
]);

const iconList = ref();
watch(() => props.offsetTop, () => {
  iconList.value.scrollTop = props.offsetTop;
});
</script>