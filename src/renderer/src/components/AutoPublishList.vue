<script setup lang="tsx">
import {
  NButton,
  NModal,
  NForm,
  NFormItem,
  NDataTable,
  NSpin,
  NInput,
  DataTableColumn,
  NSpace,
  FormInst,
  NDatePicker,
  useMessage,
  FormRules
} from 'naive-ui'
import { onMounted, reactive, watch } from 'vue'
import { RefreshSharp } from '@vicons/ionicons5'
import { IpcChannel } from '@shared/ipc'
import { Invoke } from '@renderer/utils/ipcRenderer'

const createColumns = () => {
  return [
    {
      title: '标题',
      key: 'title',
      ellipsis: {
        tooltip: true
      }
    },
    {
      title: '描述',
      key: 'desc',
      ellipsis: {
        tooltip: true
      }
    },
    {
      title: '发布账号',
      key: 'account',
      render: (row) => {
        return row.account?.nickname
      }
    },
    {
      title: '发布时间',
      key: 'create_time',
      width: 180,
      render: (row) => {
        return new Date(row.create_time).toLocaleString()
      }
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
    const list = (await Invoke(IpcChannel.GetArticleList)) as ArticleDataItem[]
    console.log('list: ', list)
    state.tableData = list.sort((a, b) => b.create_time - a.create_time).filter((e) => e.isAuto)
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
      <div class="btn-wrapper" style="margin-bottom: 10px">
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
      max-height="600"
      :columns="state.tableColumns"
      :data="state.tableData"
      :pagination="state.pagination"
    />
  </n-spin>
</template>

<style lang="less" scoped></style>
