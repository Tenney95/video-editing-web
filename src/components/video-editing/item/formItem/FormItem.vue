<template>
  <div class="form-item" v-if="componentData.dataType !== 'Flex'">
    <span class="form-title" v-show="componentData.name">{{ componentData.name }}</span>
    <div class="form-content">
      <NTabs v-if="componentData.dataType === 'Tabs'" v-bind="componentData.attr || {}" v-model:value="activeIndex">
        <template v-for="(tab, index) in componentData.children" :key="index">
          <NTabPane :tab="tab.name" :name="index">
            <FormItem v-for="(item, itemIndex) in tab.children" :key="itemIndex" :componentData="item"
              v-bind="$attrs" />
          </NTabPane>
        </template>
      </NTabs>

      <NCollapse v-else-if="componentData.dataType === 'Collapse'" v-model:value="activeIndex">
        <template v-for="(pane, index) in componentData.children" :key="index">
          <NCollapseItem :title="pane.name" :name="index">
            <NForm :label-width="20" size="small">
              <FormItem v-for="(item, itemIndex) in pane.children" :key="itemIndex" :componentData="item"
                v-bind="$attrs" />
            </NForm>
          </NCollapseItem>
        </template>
      </NCollapse>

      <NSlider v-else-if="componentData.dataType === 'Slider'" v-model:value="formValue" v-bind="componentData.attr" />
      <NInput v-else-if="componentData.dataType === 'String'" v-model:value="formValue" type="textarea"
        v-bind="componentData.attr" size="small" />
      <NInputNumber v-else-if="componentData.dataType === 'Number'" v-model:value="formValue"
        v-bind="componentData.attr" size="small" />
      <NRadioGroup v-else-if="componentData.dataType === 'Radio'" v-model:value="formValue" v-bind="componentData.attr">
        <template v-for="radioItem in componentData.children" :key="index">
          <NRadio :label="radioItem.value" size="small">
            {{ radioItem.name }}
          </NRadio>
        </template>
      </NRadioGroup>
      <NRadioGroup v-else-if="componentData.dataType === 'RadioButton'" v-model:value="formValue"
        v-bind="componentData.attr">
        <template v-for="radioItem in componentData.children" :key="index">
          <NRadioButton :label="radioItem.value" size="small">
            {{ radioItem.name }}
          </NRadioButton>
        </template>
      </NRadioGroup>
      <NSwitch v-else-if="componentData.dataType === 'Boolean'" v-model:value="formValue" v-bind="componentData.attr" />
      <NInput v-else-if="componentData.dataType === 'TextArea'" v-model:value="formValue" v-bind="componentData.attr"
        type="textarea" :autosize="{ minRows: 3, maxRows: 5 }" />
      <NColorPicker v-else-if="componentData.dataType === 'Color'" v-model:value="formValue" v-bind="componentData.attr"
        :swatches="defaultColors" size="small" />
      <div v-else-if="componentData.dataType === 'RadioItem'">
        <NRadio :label="componentData.value" size="small">
          {{ componentData.name }}
        </NRadio>
      </div>
      <div v-else-if="componentData.dataType === 'RadioButtonItem'">
        <NRadioButton :label="componentData.value" size="small">
          {{ componentData.name }}
        </NRadioButton>
      </div>

    </div>
    <span v-if="componentData.dataType === 'Slider'" class="ml-2 w-12 text-center text-sm leading-8">
      {{ formValue }}{{ componentData.label }}
    </span>

  </div>
  <div class="form-item form-item-flex" v-else-if="componentData.dataType === 'Flex'">
    <FormItem v-for="(item, index) in componentData.children" :key="index" :componentData="item" v-bind="$attrs" />
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTrackState } from '@/store/modules/videoediting/trackState';
import { storeToRefs } from 'pinia';
import { set } from 'lodash-es';
import defaultColors from './color/colorSet';
import { NTabs, NTabPane, NCollapse, NColorPicker, NCollapseItem, NRadio, NRadioGroup, NRadioButton, NSlider, NForm, NInput, NInputNumber, NSwitch } from 'naive-ui';
const props = defineProps({
  componentData: {
    type: Object,
    default() {
      return {};
    }
  },
  index: {
    type: Number,
    default: 0
  }
});
const trackStore = useTrackState();
const activeIndex = ref(props.componentData.defaultValue); // 内部状态
const { selectResource, selectTrackItem, trackList } = storeToRefs(trackStore);

// 自定义的 get 方法
function customGet(obj: any, path: string) {
  if (!obj || typeof obj !== 'object' || !path) {
    return undefined;
  }
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && current[key] !== undefined) {
      current = current[key];
    } else {
      return undefined;
    }
  }
  return current;
}

const formValue = computed({
  get() {
    if (selectResource.value && props.componentData.mappingKey) {
      const trackItem = trackList.value[selectTrackItem.value.line].list[selectTrackItem.value.index];
      return customGet(trackItem, props.componentData.mappingKey);
    } else {
      return null;
    }
  },
  set(value) {
    if (selectResource.value && props.componentData.mappingKey) {
      const trackItem = trackList.value[selectTrackItem.value.line].list[selectTrackItem.value.index];
      set(trackItem, props.componentData.mappingKey, value); // 使用 lodash set
    }
  }
});
</script>
<style scoped>
.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.form-title {
  width: 30px;
  text-align: right;
  margin-right: 10px;
  white-space: nowrap;
  font-size: 13px;
}

.form-content {
  flex: 1;
}

.form-item-flex {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
}
</style>
