<script setup lang="ts">
import { NTabs, NTabPane } from 'naive-ui'
import PublishList from './PublishList.vue'
import Publish from './Publish.vue'
import { reactive } from 'vue';

const state = reactive({
  activeTab: 'new'
})

const onChangeTab = (name: string) => {
  state.activeTab = name
}
</script>

<template>
  <n-tabs v-model:value="state.activeTab" type="card" animated display-directive="show:lazy">
    <n-tab-pane name="list" tab="作品列表">
      <PublishList @change-tab="onChangeTab" />
    </n-tab-pane>
    <n-tab-pane name="new" tab="发布新的">
      <Publish @change-tab="onChangeTab" />
    </n-tab-pane>
  </n-tabs>
</template>

<style lang="less" scoped></style>
