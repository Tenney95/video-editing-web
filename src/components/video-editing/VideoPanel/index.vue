<template>
  <NCard class="overflow-hidden flex flex-col w-300px h-full" size="small">
    <div>
      <NButton v-if="ntabsName !== 'text'" @click="onUpload()" size="small">导入素材</NButton>
      <NButton v-else @click="addTrackItem({ fill: '#fff' })" size="small">添加文字</NButton>
    </div>

    <!--显示上传后的视频-->
    <div class="flex flex-wrap mt-2 h-full overflow-auto">
      <NTabs v-model:value="ntabsName" type="line" animated>
        <NTabPane name="all" tab="全部">
          <div class="flex flex-wrap">
            <div v-for="(item, index) in resourceStore.fileList" :key="index"
              class="w-80px h-80px m-1 bg-[#000] item-box" draggable="true" @dragstart="onDragStart($event, item.id)"
              @dragend="onDragEnd" @click="handlerItem(item.id)">
              <span v-if="item.type.startsWith('audio')">{{ item.name }}</span>
              <img v-else :src="item.thumbnail" alt="" class="w-80px h-80px m-auto object-contain">
            </div>
          </div>
        </NTabPane>
        <NTabPane name="video" tab="视频">
          <div class="flex flex-wrap">
            <div v-for="(item, index) in videoList" :key="index" class="w-80px h-80px m-1 bg-[#000] item-box"
              draggable="true" @dragstart="onDragStart($event, item.id)" @dragend="onDragEnd"
              @click="handlerItem(item.id)">
              <img :src="item.thumbnail" alt="" class="w-80px h-80px m-auto object-contain">
            </div>
          </div>
        </NTabPane>
        <NTabPane name="image" tab="图片">
          <div class="flex flex-wrap">
            <div v-for="(item, index) in imageList" :key="index" class="w-80px h-80px m-1 bg-[#000] item-box"
              draggable="true" @dragstart="onDragStart($event, item.id)" @dragend="onDragEnd"
              @click="handlerItem(item.id)">
              <img :src="item.thumbnail" alt="" class="w-80px h-80px m-auto object-contain">
            </div>
          </div>
        </NTabPane>
        <NTabPane name="audio" tab="音频">
          <div class="flex flex-wrap">
            <div v-for="(item, index) in audioList" :key="index" class="w-80px h-80px m-1 bg-[#000] item-box"
              draggable="true" @dragstart="onDragStart($event, item.id)" @dragend="onDragEnd"
              @click="handlerItem(item.id)">
              {{ item.name }}
            </div>
          </div>
        </NTabPane>
        <NTabPane name="text" tab="文本">
          <TextTemplate @addText="addTrackItem" />
        </NTabPane>
      </NTabs>

    </div>
  </NCard>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { NButton, NTabs, NTabPane, NCard } from 'naive-ui';
import TextTemplate from './TextTemplate.vue';
import { useResourceStore } from '@/store/modules/videoediting/resourceStore';
import { onUpload, addTrackItem } from '@/hooks/video-editing'

const resourceStore = useResourceStore();

const ntabsName = ref('all');
const videoList = computed(() => resourceStore.fileList.filter(item => item.type.startsWith('video')));
const imageList = computed(() => resourceStore.fileList.filter(item => item.type.startsWith('image')));
const audioList = computed(() => resourceStore.fileList.filter(item => item.type.startsWith('audio')));


// 保存当前拖拽的视频 ID
let draggedVideoId = '';
function onDragStart(event: DragEvent, id: string) {
  draggedVideoId = id;
  event.dataTransfer?.setData('text/plain', id);
}

async function onDragEnd(event: DragEvent) {
  const target = event.target as HTMLElement;
  const orbitElement = document.getElementById('orbit');

  if (orbitElement && target) {
    const rect = orbitElement.getBoundingClientRect();

    if (event.clientX > rect.left &&
      event.clientX < rect.right &&
      event.clientY > rect.top &&
      event.clientY < rect.bottom) {
      const file = await resourceStore.getVideoFile(draggedVideoId);
      onUpload(file, false);
    } else {
      console.log('没有拖拽到orbit');
    }
  }
}

async function handlerItem(id: string) {
  const file = await resourceStore.getVideoFile(id);
  onUpload(file, false);
}

</script>

<style lang="scss" scoped>
.item-box {
  box-sizing: border-box;
  border-radius: 4px;

  &:hover {
    border: 1.5px solid #683cfd;
  }
}
</style>