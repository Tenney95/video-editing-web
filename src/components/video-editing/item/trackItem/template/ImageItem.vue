<template>
  <div class="flex flex-col rounded overflow-hidden h-full">
    <div class="flex items-center text-xs pl-2 overflow-hidden h-6 leading-6 bg-yellow-700 bg-opacity-70 text-gray-300">
      <img :src="trackItem.source.url" class="w-4 h-4 inline-block mr-2 shrink-0" alt="" draggable="false">
      <span class="mr-4 shrink-0">{{ trackItem.name }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import trackCheckPlaying from './trackCheckPlaying';
import { type PropType } from 'vue';
const props = defineProps({
  trackItem: {
    type: Object as PropType<VideoEditing.ImageTrackItem>,
    default() {
      return {
        width: '0px',
        left: '0px'
      };
    }
  }
});
trackCheckPlaying(props);
</script>