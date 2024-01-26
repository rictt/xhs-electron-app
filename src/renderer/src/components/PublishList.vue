<script setup lang="ts">
import { NButton, NDataTable, NSpin, DataTableColumn } from 'naive-ui'
import { onMounted, reactive } from 'vue'
import { RefreshSharp } from '@vicons/ionicons5'
import { IpcChannel } from '@shared/ipc'

const createColumns = () => {
  return [
    {
      title: '标题',
      key: 'title'
    },
    {
      title: '描述',
      key: 'desc',
      ellipsis: {
        tooltip: true
      }
    },
    {
      title: '图片',
      key: 'pictures'
    },
    {
      title: '发布账号',
      key: 'account'
    },
    {
      title: '发布时间',
      key: 'create_time'
    }
  ] as DataTableColumn[]
}
const state = reactive({
  loading: false,
  tableData: [],
  pagination: {
    pageSize: 10
  },
  tableColumns: createColumns()
})

const goSync = async () => {
  getList()
}

const getList = async () => {
  try {
    state.loading = true
    const list = await window.electron.ipcRenderer.invoke(IpcChannel.GetArticleList)
    console.log('list: ', list)
    state.tableData = list
  } finally {
    state.loading = false
  }
}

onMounted(() => {
  getList()
})
</script>

<template>
  <n-spin :show="state.loading">
    <div class="table-header">
      <div class="query-wrapper"></div>
      <div class="btn-wrapper">
        <n-button type="primary" size="small" @click="goSync">
          <template #icon>
            <RefreshSharp />
          </template>
          刷新
        </n-button>
      </div>
    </div>
    <n-data-table
      bordered
      max-height="420"
      :columns="state.tableColumns"
      :data="state.tableData"
      :pagination="state.pagination"
    />
  </n-spin>
</template>

<style lang="less" scoped></style>
