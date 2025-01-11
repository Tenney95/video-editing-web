<template>
  <div class="pl-4 pb-1 pr-10 h-5 border-b dark:border-darker border-gray-300">
    <div class="float-left h-5 w-32 flex flex-row flex-nowrap items-center justify-around">
      <div v-for="item of icons" :key="item.title" @click="handlerIcon(item)">
        <NTooltip :disabled="item.disable" class="bg-gray-400" :content="item.title" placement="bottom-start">
          <template #trigger>
            <NButton quaternary circle :disabled="item.disable">
              <template #icon>
                <Icon :icon="item.icon" class="focus:outline-0" />
              </template>
            </NButton>
          </template>
          <span>{{ item.title }}</span>
        </NTooltip>
      </div>
    </div>
    <div class="float-right flex w-70 h-5 justify-center items-center">
      <Icon icon="material-symbols:check-indeterminate-small-rounded" class="cursor-pointer font-size-24px mr"
        @click="changeScale(-10)" />
      <NSlider v-model:value="modelValue" v-bind="sliderProps" size="small" />
      <Icon icon="material-symbols:add" class="cursor-pointer font-size-24px ml" @click="changeScale(10)" />
    </div>
  </div>
</template>

<script setup lang="tsx">
import { reactive, computed } from 'vue';
import { Icon } from '@iconify/vue'
import { NTooltip, NSlider, NButton } from 'naive-ui';
import { useTrackState } from '@/store/modules/videoediting/trackState';
import { usePlayerState } from '@/store/modules/videoediting/playerState';

const props = defineProps({
  modelValue: {
    type: Number,
    default: 30
  }
});
const emit = defineEmits({
  'update:modelValue': val => {
    return val !== null;
  }
});
const trackStore = useTrackState();
const playerStore = usePlayerState();

const modelValue = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  }
});

const sliderProps = reactive({
  showTooltip: false,
  size: 'small',
  step: 10,
  max: 100,
  min: 0
});

function changeScale(val: number) {
  let newVal = modelValue.value + val;
  if (newVal > sliderProps.max) newVal = sliderProps.max;
  if (newVal < sliderProps.min) newVal = sliderProps.min;
  modelValue.value = newVal;
}
const icons = computed(() => [
  {
    title: '撤销',
    disable: true,
    icon: 'hugeicons:arrow-move-up-left',
    type: 'undo'

  },
  {
    title: '前进',
    disable: true,
    icon: 'hugeicons:arrow-move-up-right',
    type: 'redo'
  },
  {
    title: '分割',
    disable: trackStore.selectTrackItem.line === -1 && trackStore.selectTrackItem.index === -1,
    icon: 'material-symbols:split-scene-outline',
    type: 'split'
  },
  {
    title: '删除',
    disable: trackStore.selectTrackItem.line === -1 && trackStore.selectTrackItem.index === -1,
    icon: 'hugeicons:delete-02',
    type: 'delete'
  }
]);

function handlerIcon(item: Record<string, any>) {
  const { type, disable } = item;
  if (disable) return;
  if (type === 'delete') {
    if (trackStore.selectTrackItem.line !== -1 && trackStore.selectTrackItem.index !== -1) {
      trackStore.removeTrack(trackStore.selectTrackItem.line, trackStore.selectTrackItem.index);
      trackStore.selectTrackItem.line = -1;
      trackStore.selectTrackItem.index = -1;
    }
  } else if (type === 'undo') {
    // store._undo();
  } else if (type === 'redo') {
    // store._redo();
  } else if (type === 'split') {
    // 判断分割时间是否在视频内
    let splitTime = playerStore.playStartFrame;
    let active = trackStore.trackList[trackStore.selectTrackItem.line].list[trackStore.selectTrackItem.index];

    if (splitTime > active.start && splitTime < active.end && active.type === 'video') {
      const videoTrack = (active as VideoEditing.VideoTrackItem).split(splitTime);
      videoTrack.resize({ width: playerStore.playerWidth, height: playerStore.playerHeight });
      trackStore.addTrack(videoTrack);
    }
  }
}
</script>