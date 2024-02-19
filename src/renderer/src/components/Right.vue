<script setup>
import { NCard, NResult, NButton } from 'naive-ui'
import { PersonAddOutline } from '@vicons/ionicons5'
import { globalState } from '@renderer/store'
import AccountPanel from './AccountPanel.vue'
import ManagePublish from './ManagePublish.vue'

defineEmits(['add-account'])
</script>

<template>
  <div id="right-container" class="right-container">
    <n-card class="right-card-wrapper" style="margin-bottom: 16px; height: 100%; padding: 10px">
      <KeepAlive v-for="account in globalState.accountList" :key="account.user_id">
        <AccountPanel
          v-show="globalState.currentAccount?.user_id === account.user_id"
          :key="account.user_id"
          :account="account"
        />
      </KeepAlive>
      <div
        v-if="!globalState.currentAccount && !globalState.activeComponetName"
        style="
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          display: flex;
        "
      >
        <n-result status="404" title="请先选择账号" description="请先选择/添加账号～">
          <template #footer>
            <n-button type="primary" @click="$emit('add-account')">
              立即添加
              <template #icon>
                <PersonAddOutline />
              </template>
            </n-button>
          </template>
        </n-result>
      </div>
    </n-card>

    <div v-show="globalState.activeComponetName" class="sys-scrollbar other-content">
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
