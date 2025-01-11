<template>
  <div class="flex flex-col rounded overflow-hidden h-full">
    <div class="flex items-center text-xs pl-2 overflow-hidden h-6 leading-6 bg-green-700 bg-opacity-70 text-gray-300">
      <Icon icon="material-symbols:transition-fade" class="inline-block mr-2 shrink-0 font-size-16px" />
      <span class="mr-4 shrink-0">{{ props.trackItem.name }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import trackCheckPlaying from './trackCheckPlaying';
import { PropType } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps({
  trackItem: {
    type: Object as PropType<any>,
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