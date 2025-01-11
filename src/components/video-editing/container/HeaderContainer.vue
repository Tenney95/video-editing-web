<template>
  <header class="h-32px w-full flex flex-nowrap flex-row items-center justify-between pb-0.5 p-t-0.5 br-t"
    data-tauri-drag-region>
    <div class="flex pl-2 items-center" @click="openGithub">
      <img src="@/assets/logo.svg" class="w-8 select-none" alt="">
    </div>
    <div class="flex flex-row-reverse items-center">
      <div class="ml-4 mr-1" v-if="appWindow">
        <NButton class="w-32px font-size-34px" quaternary size="small" @click="appWindow.minimize()">
          <template #icon>
            <icon-mdi:window-minimize />
          </template>
        </NButton>
        <NButton class="close-but w-32px font-size-34px" quaternary type="error" size="small"
          @click="appWindow.close()">
          <template #icon>
            <icon-mdi:window-close />
          </template>
        </NButton>
      </div>
      <NButton class="mr-2" color="#683CFD" size="small" @click="onGenerate">
        合成视频
      </NButton>
      <darkMode class="mr-2" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, toRaw } from 'vue';
import { NButton, useMessage, useLoadingBar } from 'naive-ui';
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useTrackState } from '@/store/modules/videoediting/trackState';
import { usePlayerState } from '@/store/modules/videoediting/playerState';
import { AudioTrack } from '@/class/AudioTrack';
import type { Track } from '@/class/Track';
import { Combinator, type OffscreenSprite } from '@webav/av-cliper';
import { createFileWriter } from '@/utils/common';
import darkMode from '@/components/common/dark-mode.vue';

const message = useMessage();
const loadingBar = useLoadingBar();
const trackState = useTrackState();
const playerState = usePlayerState();
const appWindow = ref<any>(null);

if (window.isTauri) {
  appWindow.value = getCurrentWindow();
}

const onGenerate = async () => {
  loadingBar.start();
  const sprs: Promise<OffscreenSprite>[] = [];

  // 使用OffscreenSprite和Combinator进行视频合成
  for (const track of trackState.trackList.reduce((res, { list }) => res.concat(list as Track[]), [] as Track[])) {
    if (track instanceof AudioTrack) {
      sprs.push(toRaw(track).combine());
    } else {
      sprs.push(toRaw(track).combine({ width: playerState.playerWidth, height: playerState.playerHeight }, playerState.outputRatio));
    }
  }

  const sprites = await Promise.all(sprs);

  const com = new Combinator({
    width: playerState.playerWidth * playerState.outputRatio,
    height: playerState.playerHeight * playerState.outputRatio,
    bgColor: 'black'
  });

  await Promise.all(sprites.map((sprite, index) => {
    sprite.zIndex = 999 - index;
    return com.addSprite(sprite);
  }));

  await com.output().pipeTo(await createFileWriter());

  loadingBar.finish();

  message.success('合成视频成功');
};

function openGithub() {
  window.open('https://github.com/tenney95');
}
</script>
<style scoped>
.br-t {
  border-bottom: 1px solid #9ca3af;
}

.close-but:hover {
  background-color: rgb(208, 100, 100);
}
</style>