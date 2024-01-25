<script setup>
import { NCard, NResult, NTabs, NTabPane } from 'naive-ui'
import { reactive } from 'vue'
import Notes from './Notes.vue'
import { globalState } from '@renderer/store'

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
    <n-card class="right-card-wrapper" style="margin-bottom: 16px; height: 100%">
      <n-tabs v-model:value="state.currentTab" type="card" animated>
        <n-tab-pane
          v-for="(item, index) in state.tabs"
          :key="item.name"
          :name="item.name"
          :tab="item.label"
          display-directive="if"
        >
          <n-result
            v-if="!globalState.currentAccount"
            style="
              min-height: 400px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            "
            status="418"
            title="选择左边账号"
            description="元！启动！！"
          ></n-result>
          <component
            :is="components[state.currentTab]"
            v-show="components[state.currentTab] && globalState.currentAccount"
            :index="index"
          />
          <div v-if="globalState.currentAccount && !components[state.currentTab]">开发中...</div>
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>

<style lang="less" scoped>
.right-container {
  flex: 1;
}

.right-card-wrapper {
  :deep(.n-card__content) {
    max-height: 80vh;
  }
}
</style>
