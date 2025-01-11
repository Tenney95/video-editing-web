<template>
  <ul class="textList p-0">
    <li class="bg-layout" v-for="(item, index) in templateList" :key="index" @click="$emit('addText', item)"
      @dragend="onDragEnd($event, item)">
      <span class="text" :style="calcStyle(item)">花字</span>
    </li>
  </ul>
</template>

<script lang="ts" setup>
// import { computed } from 'vue';
import { event } from '@tauri-apps/api';
import { templateList } from './templateList';
const emit = defineEmits({
  addText: (item: any) => item
});

function calcStyle(item: { fill: string, stroke?: string, textBackgroundColor?: string }) {
  const style: any = { color: item.fill };
  const strokeWidth = 2;
  const strokeColor = item.stroke;
  if (strokeColor) {
    style.textShadow = `-${strokeWidth}px -${strokeWidth}px ${strokeColor}, ${strokeWidth}px -${strokeWidth}px ${strokeColor}, -${strokeWidth}px ${strokeWidth}px ${strokeColor}, ${strokeWidth}px ${strokeWidth}px ${strokeColor}`;
    // style.textStroke = `${strokeWidth}px ${strokeColor}`;
  }
  const backgroundColor = item.textBackgroundColor;
  if (backgroundColor) {
    style.backgroundColor = backgroundColor;
  }
  return style;
}

async function onDragEnd(event: DragEvent, item: any) {
  const target = event.target as HTMLElement;
  const orbitElement = document.getElementById('orbit');

  if (orbitElement && target) {
    const rect = orbitElement.getBoundingClientRect();

    if (event.clientX > rect.left &&
      event.clientX < rect.right &&
      event.clientY > rect.top &&
      event.clientY < rect.bottom) {
      emit('addText', item)
    } else {
      console.log('没有拖拽到orbit');
    }
  }
}

// const style = computed(() => {
//   const strokeWidth = 2;
//   const strokeColor = 'red';
//   return {
//     textShadow: `-${strokeWidth}px -${strokeWidth}px red, ${strokeWidth}px -${strokeWidth}px red, -${strokeWidth}px ${strokeWidth}px red, ${strokeWidth}px ${strokeWidth}px ${strokeColor}`
//   };
// });
</script>

<style lang="scss" scoped>
.text {
  display: inline-block;
  font-size: 32px;
  border-radius: 8px;
  padding: 4px;
  line-height: 1;
  font-weight: 800;
}

.textList {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;

  li {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    width: 80px;
    height: 80px;
    border-radius: 4px;
    text-align: center;
    font-weight: 500;
    font-size: 16px;
    margin-right: 8px;
    margin-bottom: 8px;
    box-sizing: border-box;
    cursor: pointer;

    img {
      width: 74px;
      height: 44px;
      object-fit: contain;
      transition: 0.5s;
    }

    &:hover {
      border: 1.5px solid #683cfd;
    }
  }
}
</style>
