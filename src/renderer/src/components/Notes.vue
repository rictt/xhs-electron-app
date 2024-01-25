<script setup lang="tsx">
import { NButton, NDataTable, NSpin } from 'naive-ui'
import { onMounted, reactive, toRaw, watch } from 'vue'
import { RefreshSharp } from '@vicons/ionicons5'
import { IpcChannel } from '@shared/ipc'
import { globalState } from '@renderer/store'

const props = defineProps({
  index: {
    type: Number
  }
})

const createColumns = () => {
  return [
    {
      title: '笔记名称',
      key: 'title',
      ellipsis: {
        tooltip: true
      },
      render: (row) => {
        return (
          <NButton text tag="a" href={row.note_href} target="_blank">
            {row.title}
          </NButton>
        )
      }
    },
    {
      title: '点赞',
      key: 'count',
      align: 'center',
      width: 100,
      render: (row) => {
        return row.count
      }
    },
    {
      title: '回复文本',
      width: 100,
      ellipsis: {
        tooltip: true
      },
      key: 'replayText',
      render: () => {
        return '私[doge]回复文本'
      }
    },
    {
      title: '操作',
      key: 'operator',
      width: 140,
      render: (row: NoteDataItem) => {
        return (
          <>
            {row.status === 'idle' ? (
              <NButton type="primary" onClick={() => monitorNote(row.note_id)}>
                自动回复
              </NButton>
            ) : (
              <NButton onClick={() => cancelMonitorNote(row.note_id)}>取消自动回复</NButton>
            )}
          </>
        )
      }
    }
  ]
}

const state = reactive({
  loading: false,
  tableData: [
    {
      note_href: 'https://www.xiaohongshu.com/explore/657055250000000009026490',
      title: '嘎嘎好吃好做的家常菜！',
      count: '2',
      status: 'idle',
      cover:
        'https://sns-webpic-qc.xhscdn.com/202401231203/61a84fc783729605b383da0fef9e8af5/1040g2sg30s4tinanis6g5oeuc0d417n9h94l8j8!nc_n_webp_mw_1'
    }
  ] as NoteDataItem[],
  tableColumns: createColumns(),
  pagination: {
    pageSize: 10
  }
})

const goSync = async () => {
  fetchAccountNotes(globalState.currentAccount, true)
}

const fetchAccountNotes = async (account: XhsAccount, sync: boolean = false) => {
  if (state.loading) {
    return
  }
  state.loading = true
  try {
    const notes = await window.electron.ipcRenderer.invoke(
      IpcChannel.GetNoteList,
      toRaw(account),
      sync
    )
    console.log('notes: ', notes)
    state.tableData = notes
  } catch (error) {
    console.log(error)
  } finally {
    state.loading = false
  }
}

const monitorNote = async (note_id: string) => {
  console.log('monitor ', note_id)
}

const cancelMonitorNote = async (note_id: string) => {
  console.log('cancel monitor ', note_id)
}

watch(
  () => globalState.currentAccount,
  (value) => {
    if (value && value.user_id) {
      fetchAccountNotes(value)
    }
  },
  {
    immediate: true
  }
)
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
          一键同步
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

<style lang="less" scoped>
.table-header {
  display: flex;
  margin-bottom: 10px;
  z-index: 2001;
}
</style>
