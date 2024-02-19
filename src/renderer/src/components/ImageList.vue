<script setup lang="ts">
import { NImageGroup, NSpace, NImage, NIcon } from 'naive-ui'
import { Close, Eye } from '@vicons/ionicons5'
import { watch, ref } from 'vue'

const props = defineProps<{ modelValue: string[]; remove?: boolean }>()
const emits = defineEmits(['update:modelValue'])
const imgList = ref<string[]>([])

watch(
  () => props.modelValue,
  (value) => {
    imgList.value = value
  },
  { immediate: true }
)

watch(
  () => imgList,
  (value) => {
    emits('update:modelValue', value)
  }
)

const clearItem = (index) => {
  imgList.value.splice(index, 1)
}
</script>

<template>
  <n-image-group>
    <n-space>
      <div v-for="(item, index) in imgList" :key="item" class="image-wrapper">
        <n-image width="100" :src="item" />
        <div v-if="$props.remove" class="operation">
          <!-- <NIcon>
            <Eye />
          </NIcon> -->
          <NIcon @click="clearItem(index)">
            <Close />
          </NIcon>
        </div>
      </div>
    </n-space>
  </n-image-group>
</template>

<style lang="less" scoped>
.image-wrapper {
  position: relative;
  &:hover {
    .operation {
      display: flex;
    }
  }
  .operation {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 11;
    background-color: rgba(0, 0, 0, 0.5);
    display: none;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    .n-icon {
      margin-right: 10px;
      font-size: 20px;
      color: #fff;
      cursor: pointer;
    }
  }
}
</style>
