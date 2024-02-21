<script setup lang="ts">
import { NTabs, NTabPane } from 'naive-ui'
import PublishList from './PublishList.vue'
import Publish from './Publish.vue'
import { reactive } from 'vue'
import { Invoke } from '@renderer/utils/ipcRenderer'
import { IpcChannel } from '@shared/ipc'

const state = reactive({
  activeTab: 'list'
})

const onChangeTab = (name: string) => {
  state.activeTab = name
}
const operationNote = async () => {
  const list = await Invoke(IpcChannel.GetAccountList)
  console.log(list)
  await Invoke(IpcChannel.OperationNote, {
    account: list[0],
    note_link: 'https://www.xiaohongshu.com/explore/65bb0e7e000000002c015c5e',
    isLike: true,
    isCollect: true,
    isComment: true,
    commentText: '我！我去！马上去养一只！！'
  } as NoteOperationOps)
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
