<script setup lang="tsx">
import { NButton, NIcon, NDataTable, NInput, NSpin, DataTableColumn, useMessage } from 'naive-ui'
import { onMounted, reactive, toRaw, inject } from 'vue'
import { RefreshSharp } from '@vicons/ionicons5'
import { Edit } from '@vicons/carbon'
import { IpcChannel } from '@shared/ipc'
import { globalState } from '@renderer/store'

const account = inject<XhsAccount>('account')

const message = useMessage()

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
      width: 140,
      ellipsis: {
        tooltip: true
      },
      key: 'reply_text',
      render: (row: NoteDataItem, index) => {
        const setEditReplyIndex = () => {
          state.editReplyIndex = index
        }
        if (state.editReplyIndex === index) {
          const onBlur = () => {
            window.electron.ipcRenderer.invoke(
              IpcChannel.UpdateNote,
              row.note_id,
              'reply_text',
              row.reply_text
            )
            state.editReplyIndex = -1
          }
          return (
            <NInput
              value={row.reply_text}
              placeholder="不能为空"
              onInput={(e) => {
                row.reply_text = e
              }}
              onBlur={onBlur}
            />
          )
        }
        if (row.reply_text) {
          return (
            <div style="display: flex; align-items: center;">
              <span style="flex: 1; text-overflow: ellipsis; overflow: hidden;">
                {row.reply_text}
              </span>
              <NIcon style="cursor: pointer; margin-left: 4px;" onClick={setEditReplyIndex}>
                <Edit />
              </NIcon>
            </div>
          )
        }
        return (
          <NButton text type="primary" onClick={setEditReplyIndex}>
            设置
          </NButton>
        )
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
              <NButton type="primary" onClick={() => monitorNote(row)}>
                自动回复
              </NButton>
            ) : null}
            {row.status === 'monitor' ? (
              <NButton onClick={() => cancelMonitorNote(row)}>取消自动回复</NButton>
            ) : null}
          </>
        )
      }
    }
  ] as DataTableColumn[]
}

const state = reactive({
  loading: false,
  tableData: [] as NoteDataItem[],
  tableColumns: createColumns(),
  pagination: {
    pageSize: 10
  },
  editReplyIndex: -1,
  monitorId: ''
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
    message.error(error)
  } finally {
    state.loading = false
  }
}

const monitorNote = async (row: NoteDataItem) => {
  const { reply_text, note_id } = row
  if (!note_id || !reply_text) {
    message.error('笔记Id、回复文本不能为空')
    return
  }
  console.log('monitor ', note_id)
  const monitorId = await window.electron.ipcRenderer.invoke(
    IpcChannel.StartNoteMonitor,
    toRaw(account),
    note_id,
    reply_text
  )
  // state.monitorId = monitorId
  row.monitor_id = monitorId
  row.status = 'monitor'
}

const cancelMonitorNote = async (row: NoteDataItem) => {
  if (!row.monitor_id) {
    await window.electron.ipcRenderer.invoke(IpcChannel.CancelNoteMonitor, row.monitor_id)
  }
  row.status = 'idle'
}

onMounted(() => {
  if (account && account.user_id) {
    fetchAccountNotes(account)
  }
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
          一键同步
        </n-button>
      </div>
    </div>
    <n-data-table
      bordered
      max-height="800"
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
