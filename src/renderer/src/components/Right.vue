<script setup>
import { NCard, NTabs, NTabPane } from 'naive-ui'
import { reactive } from 'vue'
import Notes from './Notes.vue'

const state = reactive({
  tabs: [
    { name: 'Notes', label: '笔记列表' },
    { name: 'Fans', label: '粉丝列表' },
    { name: 'CareList', label: '我关注的' }
  ],
  currentTab: 'Notes'
})

const components = {
  Notes: Notes
}
</script>

<template>
  <div class="right-container">
    <n-card style="margin-bottom: 16px">
      <n-tabs v-model:value="state.currentTab" type="card" animated>
        <n-tab-pane
          v-for="item in state.tabs"
          :key="item.name"
          :name="item.name"
          :tab="item.label"
          display-directive="show"
        >
          <component :is="components[state.currentTab]" />
          <div v-if="!components[state.currentTab]">{{ item.label }}</div>
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>

<style lang="less" scoped>
.right-container {
  flex: 1;
}
</style>
