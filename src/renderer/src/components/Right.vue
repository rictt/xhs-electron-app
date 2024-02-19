<script setup>
import { NCard, NResult, NTabs, NTabPane, NIcon } from 'naive-ui'
import { reactive, watch } from 'vue'
import { CloseSharp } from '@vicons/ionicons5'
import Notes from './Notes.vue'
import { globalState } from '@renderer/store'
import AccountPanel from './AccountPanel.vue'
import ManagePublish from './ManagePublish.vue'

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

const unActiveComponent = () => {
  globalState.activeComponetName = ''
}
</script>

<template>
  <div id="right-container" class="right-container">
    <n-card class="right-card-wrapper" style="margin-bottom: 16px; height: 100%; padding: 10px;">
      <KeepAlive v-for="account in globalState.accountList" :key="account.user_id">
        <AccountPanel
          v-show="globalState.currentAccount?.user_id === account.user_id"
          :key="account.user_id"
          :account="account"
        />
      </KeepAlive>
    </n-card>

    <div class="sys-scrollbar other-content" v-show="globalState.activeComponetName">
      <!-- <div class="content-header">
        <NIcon @click="unActiveComponent">
          <CloseSharp />
        </NIcon>
      </div> -->
      <div class="content-body">
        <ManagePublish v-show="globalState.activeComponetName === 'Publish'" />
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.right-container {
  position: relative;
  z-index: 10;
  flex: 1;
}

.right-card-wrapper {
  :deep(.n-card__content) {
    max-height: 80vh;
    padding: 0;
  }
}

.other-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  overflow: auto;
  color: #000;
  padding: 10px;
  word-break: break-all;
  box-sizing: border-box;
  background-color: #fff;
  z-index: 2001;

  .content-header {
    display: flex;
    justify-content: flex-end;
    color: #999;
    .n-icon {
      cursor: pointer;
      font-size: 24px;
    }
  }
  .content-body {
    width: 100%;
    height: calc(100% - 24px);
  }
}
</style>
