<template>
  <div class="tabsToggle flex border-r pl-2 pr-2">
    <div v-for="tab in menuData" :class="selected === tab.key ? '' : ''" @click="$emit('toggle', tab)" :key="tab.key">
      <Icon :icon="tab.icon" class="font-size-24px c-inherit" />
      <span>{{ tab.title }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { menuData } from '@/data/baseMenu';
import { Icon } from '@iconify/vue';
defineProps<{
  selected: string
}>();
</script>

<style scoped lang="scss">
.tabsToggle {
  div {
    margin: 6px 7px;
    width: 66px;
    height: 58px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    i {
      font-weight: 550;
      font-size: 18px;
    }

    span {
      font-size: 11px;
      font-weight: 500;
      line-height: 18px;
    }
  }

  // .toggle {
  //   background: rgba(0, 0, 0, .3);
  //   box-shadow: 0 1px 0 0 #0000000d;
  //   border-radius: 8px;
  // }

  .divided {
    border-bottom: 1px solid #e7e7ea;
  }
}
</style>