<template>
  <div class="flex flex-col flex-1 overflow-hidden h-full bg-layout">
    <HeaderContainer />
    <div class="flex flex-1 overflow-hidden">
      <div class="flex flex-1 flex-col overflow-hidden">
        <div class="flex flex-1 flex-row flex-nowrap">
          <VideoPanel />
          <CanvasPlayer />
          <AttributeContainer />
        </div>
        <TrackContainer />
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import AttributeContainer from '@/components/video-editing/container/AttributeContainer.vue';
import CanvasPlayer from '@/components/video-editing/container/CanvasPlayer.vue';
import HeaderContainer from '@/components/video-editing/container/HeaderContainer.vue';
import TrackContainer from '@/components/video-editing/container/TrackContainer.vue';
import VideoPanel from '@/components/video-editing/VideoPanel/index.vue';
import { initHotKey } from '@/utils/videoediting/initHotKey';

initHotKey();

</script>
