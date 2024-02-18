<script setup lang="tsx">
import { NButton, NDataTable, NSpin, DataTableColumn } from 'naive-ui'
import { onMounted, reactive } from 'vue'
import { RefreshSharp } from '@vicons/ionicons5'
import { IpcChannel } from '@shared/ipc'
import ImageList from './ImageList.vue'
import { requireNativeImage } from '@renderer/utils'
import { toRaw } from 'vue'
import { Invoke } from '@renderer/utils/ipcRenderer'

const removePublish = async (row) => {
  // state.tableData = state.tableData.filter(e => e.)
  await Invoke(IpcChannel.RemovePublish, toRaw(row))
  await getList()
}

const editPublish = async (row) => {
  const data = { ...row }
  delete data.id
}

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
      title: '图片',
      key: 'pictures',
      render: (row) => {
        // return <ImageList value={row.pictures} />
        return <ImageList model-value={row.pictures?.map((e) => requireNativeImage(e))} />
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
    },
    {
      title: '操作',
      key: 'operator',
      width: 140,
      render: (row: NoteDataItem) => {
        // <NButton size="small" text type="primary" onClick={() => editPublish(row)}>
        //   编辑
        // </NButton>
        return (
          <>
            <NButton size="small" text type="error" onClick={() => removePublish(row)}>
              删除
            </NButton>
          </>
        )
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
    const list = await Invoke(IpcChannel.GetArticleList)
    console.log('list: ', list)
    state.tableData = list.sort((a, b) => b.create_time - a.create_time)
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
