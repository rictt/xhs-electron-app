<script setup lang="ts">
import { NCard, NResult, NButton, NInput, useMessage } from 'naive-ui'
import { PersonAddOutline } from '@vicons/ionicons5'
import { globalState } from '@renderer/store'
import AccountPanel from './AccountPanel.vue'
import ManagePublish from './ManagePublish.vue'
import ManageLikeComment from './ManageLikeComment.vue'
import { onMounted, reactive } from 'vue'
import { Invoke } from '@renderer/utils/ipcRenderer'
import { getChromePath, setChromePath } from '@renderer/utils/index'
import { IpcChannel } from '@shared/ipc'

const state = reactive({
  chromePath: '',
  loading: false
})

const message = useMessage()

const updateChromePath = async (showTip = true) => {
  console.log(state.chromePath)
  state.loading = true
  try {
    await Invoke(IpcChannel.SetChromePath, state.chromePath)
    setChromePath(state.chromePath)
    showTip && message.success('设置成功')
  } catch (error) {
    console.log(error)
  } finally {
    state.loading = false
  }
}

onMounted(() => {
  const value = getChromePath()
  if (value) {
    state.chromePath = value
    updateChromePath(false)
  }
  console.log('update chrome path: ', state.chromePath)
})

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

            <div style="margin: 30px 0">
              <p>启动失败时，请手动设置浏览器地址</p>
              <n-input
                v-model:value.trim="state.chromePath"
                style="flex: 1; margin-left: 10px; margin-right: 10px; width: 400px"
                placeholder="C:\\"
              />
              <n-button type="primary" :loading="state.loading" @click="updateChromePath()"
                >确认</n-button
              >
            </div>
          </template>
        </n-result>
      </div>
    </n-card>

    <div v-show="globalState.activeComponetName" class="sys-scrollbar other-content">
      <div class="content-body">
        <ManagePublish v-show="globalState.activeComponetName === 'Publish'" />
        <ManageLikeComment v-show="globalState.activeComponetName === 'LikeComment'" />
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
