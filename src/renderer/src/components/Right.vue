<script setup>
import { NCard, NResult, NTabs, NTabPane } from 'naive-ui'
import { reactive, watch } from 'vue'
import Notes from './Notes.vue'
import { globalState } from '@renderer/store'
import AccountPanel from './AccountPanel.vue'

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
      <KeepAlive v-for="account in globalState.accountList" :key="account.user_id">
        <AccountPanel
          v-show="globalState.currentAccount?.user_id === account.user_id"
          :key="account.user_id"
          :account="account"
        />
      </KeepAlive>
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
