<script setup lang="ts">
import {
  NForm,
  NFormItem,
  NInput,
  NInputGroupLabel,
  NButton,
  NCheckbox,
  NCheckboxGroup,
  NDataTable,
  NSpace,
  NRadioGroup,
  NRadio,
  FormInst,
  useMessage,
  FormRules,
  NTag,
  NInputGroup,
  NSpin,
  NSwitch,
  NDivider,
  DataTableColumn,
  NCard
} from 'naive-ui'
import { onMounted, reactive, ref, toRaw, watch } from 'vue'
import { globalState } from '@renderer/store'
import { IpcChannel } from '@shared/ipc'
import ImageList from './ImageList.vue'
import { requireNativeImage } from '@renderer/utils'
import type { OpenDialogOptions } from 'electron'
import { Invoke } from '@renderer/utils/ipcRenderer'

const props = defineProps<{
  form?: NonNullable<unknown>
  userId?: string
  isBatch?: boolean
}>()

const formValue = reactive({
  uidText: '',
  linkText: '',
  linkList: [],
  commentText: '',
  isLikeAllAccount: true,
  likeAccountList: [],
  isCollectAllAccount: false,
  collectAccountList: [],
  isCommentAllAccount: true,
  commentAccountList: [],

  commentList: []
})

const createColumns = () => {
  return [
    {
      type: 'selection'
    },
    {
      title: '序号',
      key: 'index',
      width: 50,
      render: (row, index) => {
        return index + 1
      }
    },
    {
      title: '用户uid',
      key: 'uid',
      ellipsis: {
        tooltip: true
      }
    },
    {
      title: '笔记标题',
      key: 'ntitle',
      ellipsis: {
        tooltip: true
      }
    },
    {
      title: '作品链接',
      key: 'nid',
      ellipsis: {
        tooltip: true
      },
      render: (row) => {
        return `https://www.xiaohongshu.com/explore/${row.nid}`
      }
    }
  ] as DataTableColumn[]
}

const createResultColumns = () => {
  return [
    {
      title: '序号',
      key: 'index',
      width: 50,
      render: (row, index) => {
        return index + 1
      }
    },
    {
      title: '操作账号',
      key: 'account.nickname'
    },
    {
      title: '用户uid',
      key: 'uid',
      ellipsis: {
        tooltip: true
      }
    },
    {
      title: '笔记标题',
      key: 'ntitle',
      ellipsis: {
        tooltip: true
      }
    },
    {
      title: '作品链接',
      key: 'nid',
      ellipsis: {
        tooltip: true
      },
      render: (row) => {
        return `https://www.xiaohongshu.com/explore/${row.nid}`
      }
    },
    {
      title: '是否点赞',
      key: 'isLike',
      render: (row) => (row.isLike ? '是' : '')
    },
    {
      title: '是否收藏',
      key: 'isCollect',
      render: (row) => (row.isCollect ? '是' : '')
    },
    {
      title: '是否评论',
      key: 'isComment',
      render: (row) => (row.isComment ? '是' : '')
    }
  ] as DataTableColumn[]
}

const state = reactive({
  uidText: '',
  // uidText: '5b72dbad0e82130001212d31\n5f35634d000000000100621e',
  sticky: false,
  loading: false,
  tableData: [] as UserPublishNote[],
  pagination: {
    pageSize: 10
  },
  extractNum: '3',
  likeIndex: '1',
  collectIndex: '2',
  commentIndex: '3',
  interval: '3',
  commentText: '',
  selectAccountList: [],
  allTableData: [] as UserPublishNote[],
  tableColumns: createColumns(),
  resultTableData: [],
  resultTableColumns: createResultColumns()
})

const message = useMessage()
const formRef = ref<FormInst | null>(null)

const addNewComment = () => {
  if (formValue.commentText) {
    formValue.commentList.unshift(formValue.commentText)
    formValue.commentText = ''
  }
}

const onCheckboxListChange = (value) => {
  if (value && value.length === globalState.accountList.length) {
    return true
  }
  return false
}

const formatAllDataList = () => {
  const allData = state.allTableData
  const userNotesMap = {}
  allData.forEach((note: UserPublishNote) => {
    const key = note.uid
    if (!userNotesMap[key]) {
      userNotesMap[key] = []
    }
    userNotesMap[key].push(note)
  })

  return userNotesMap
}

const submit = async () => {
  const { uidText, sticky, extractNum } = state
  if (!uidText) {
    message.error('用户ID不能为空')
    return
  }
  state.loading = true
  const uniMap = {}
  const uids = uidText.split('\n').filter((e) => {
    if (uniMap[e]) return false
    uniMap[e] = true
    return true
  })
  console.log(uidText)
  console.log('uids: ', uids)
  const list = await Invoke(IpcChannel.GetUserPublishList, uids)
  state.allTableData = [...list]
  const userNotesMap = formatAllDataList()
  const tableList = []
  Object.keys(userNotesMap).forEach((uid) => {
    const noteList = userNotesMap[uid].filter((e) => e.sticky === sticky)
    const __list = extractNum ? noteList.slice(0, parseInt(extractNum)) : noteList
    tableList.push(...__list)
  })
  console.log(userNotesMap, tableList)
  state.tableData = tableList
  state.loading = false
  console.log('notes: ', list)
}

const submitNext = async () => {
  const {
    likeIndex,
    collectIndex,
    commentIndex,
    interval,
    commentText,
    sticky,
    selectAccountList
  } = state
  if (!commentText) {
    message.error('请输入评论内容')
    return
  }
  if (!selectAccountList || !selectAccountList.length) {
    message.error('请选择操作账号')
    return
  }
  const userNotesMap = formatAllDataList()
  const notes: UserPublishNote[] = []
  for (const [_user_id, userNotes] of Object.entries(userNotesMap)) {
    if (userNotes && (userNotes as [])?.length) {
      const __list = (userNotes as any[]).filter((e) => e.sticky === sticky)
      const likeItem = __list[parseInt(likeIndex) - 1] || __list[0]
      const collectItem = __list[parseInt(collectIndex) - 1] || __list[0]
      const commentItem = __list[parseInt(commentIndex) - 1] || __list[0]
      likeItem && notes.push(likeItem)
      collectItem && notes.push(collectItem)
      commentItem && notes.push(commentItem)
    }
  }

  const operations: NoteOperationOps[] = []
  for (let i = 0; i < selectAccountList.length; i++) {
    const account = globalState.accountList.find((e) => e.user_id === selectAccountList[i])
    if (account) {
      for (let j = 0; j < notes.length; j++) {
        const isLike = likeIndex ? (j % 3) + 1 === parseInt(likeIndex) : true
        const isCollect = collectIndex ? (j % 3) + 1 === parseInt(collectIndex) : true
        const isComment = commentIndex ? (j % 3) + 1 === parseInt(commentIndex) : true
        const note = notes[j]
        operations.push({
          account: toRaw(account),
          note_link: `https://www.xiaohongshu.com/explore/${note.nid}`,
          isLike,
          isCollect,
          isComment,
          commentText: commentText,
          interval: interval ? parseInt(interval) * 1000 : null
        })
      }
    }
  }

  console.log('代执行操作笔记：', notes)
  console.log('含账号操作记录条数为：', operations)
  state.loading = true
  const result = []
  for (let z = 0; z < operations.length; z++) {
    const opts = operations[z]
    const response = await Invoke(IpcChannel.OperationNote, opts as NoteOperationOps)
    result.push(response)
    if (interval) {
      const __time = parseInt(interval) * 1000
      await new Promise((resolve) => setTimeout(resolve, __time))
    }
  }
  state.loading = false
  message.success('执行成功')
  console.log('result: ', result)
}

onMounted(async () => {
  globalState.accountList = await Invoke(IpcChannel.GetAccountList)
})
</script>

<template>
  <n-spin :show="state.loading">
    <n-form ref="formRef" label-placement="left" :label-width="120" :model="formValue">
      <n-form-item label="用户ID(uid)" path="linkText" required>
        <n-input
          v-model:value="state.uidText"
          type="textarea"
          rows="10"
          placeholder="一行一个用户id，换行输入多个用户，比如&#10;65b45ccc000000000e02336b&#10;5b1954e411be10416d1ca77d&#10;5ae6d6a2e8ac2b32d0e401a6"
        />
      </n-form-item>

      <n-form-item label="提取参数" required>
        <n-space>
          <n-form-item>
            <n-input-group>
              <n-input-group-label>用户笔记数</n-input-group-label>
              <n-input
                v-model:value="state.extractNum"
                style="width: 140px"
                placeholder="不填默认全部"
              />
            </n-input-group>
          </n-form-item>
          <n-form-item label="包含置顶笔记">
            <n-switch v-model:value="state.sticky" />
          </n-form-item>
        </n-space>
      </n-form-item>

      <n-form-item>
        <div style="width: 100%; display: flex; align-items: center; justify-content: center">
          <n-button type="primary" @click="submit">
            {{ state.tableData.length ? '重新提取' : '提取作品列表' }}
          </n-button>
        </div>
      </n-form-item>

      <n-divider />

      <div v-if="state.tableData.length">
        <h3>提取结果</h3>
        <n-data-table
          bordered
          max-height="600"
          size="small"
          :columns="state.tableColumns"
          :data="state.tableData"
          :pagination="state.pagination"
        />
      </div>

      <template v-if="state.tableData.length">
        <n-form-item label="互动参数" required>
          <n-space>
            <n-form-item label-width="auto" label="">
              <n-input-group>
                <n-input-group-label>点赞/收藏/评论间隔(秒)</n-input-group-label>
                <n-input v-model:value="state.interval" placeholder="请输入秒" />
              </n-input-group>
            </n-form-item>
            <n-space>
              <n-form-item label-width="auto" label="">
                <n-input-group>
                  <n-input-group-label>点赞第几篇</n-input-group-label>
                  <n-input
                    v-model:value="state.likeIndex"
                    style="width: 140px"
                    placeholder="不填点赞所有"
                  />
                </n-input-group>
              </n-form-item>
              <n-form-item label-width="auto" label="">
                <n-input-group>
                  <n-input-group-label>收藏第几篇</n-input-group-label>
                  <n-input
                    v-model:value="state.collectIndex"
                    style="width: 140px"
                    placeholder="不填收藏所有"
                  />
                </n-input-group>
              </n-form-item>
              <n-form-item label-width="auto" label="">
                <n-input-group>
                  <n-input-group-label>评论第几篇</n-input-group-label>
                  <n-input
                    v-model:value="state.commentIndex"
                    style="width: 140px"
                    placeholder="不填评论所有"
                  />
                </n-input-group>
              </n-form-item>
            </n-space>
          </n-space>
        </n-form-item>

        <n-form-item label="评论内容">
          <div style="width: 90%">
            <n-input
              v-model:value="state.commentText"
              style="width: 100%"
              type="textarea"
              placeholder="请输入评论内容"
            />
            <!-- <n-button type="primary" style="margin: 10px 0" @click="addNewComment"
              >新增评论</n-button
            >
            <p style="color: #666; margin-top: 10px">当有多条评论内容时，将按顺序重复使用</p>
            <div class="comment-list">
              <div v-for="(item, index) in formValue.commentList" :key="index" class="comment-item">
                <n-input
                  v-model:value="formValue.commentList[index]"
                  class="input-item"
                  type="textarea"
                />
                <div>
                  <n-button text type="primary" @click="formValue.commentList.splice(index, 1)"
                    >删除</n-button
                  >
                </div>
              </div>
            </div> -->
          </div>
        </n-form-item>

        <n-form-item label="操作账号" path="isPublic">
          <n-checkbox-group v-model:value="state.selectAccountList" name="radiogroup">
            <n-space>
              <n-checkbox
                v-for="item in globalState.accountList"
                :key="item.user_id"
                :value="item.user_id"
                >{{ item.nickname }}</n-checkbox
              >
            </n-space>
          </n-checkbox-group>
        </n-form-item>

        <n-form-item>
          <div style="width: 100%; display: flex; align-items: center; justify-content: center">
            <n-button type="primary" @click="submitNext">执行截流</n-button>
          </div>
        </n-form-item>
      </template>

      <div v-if="state.resultTableData.length">
        <h3>执行结果</h3>
        <n-data-table
          bordered
          max-height="600"
          size="small"
          :columns="state.resultTableColumns"
          :data="state.resultTableData"
          :pagination="state.pagination"
        />
      </div>
    </n-form>
  </n-spin>
</template>

<style lang="less" scoped>
.comment-list {
  display: flex;
  flex-wrap: wrap;
  column-gap: 10px;
}
.comment-item {
  width: 49%;
  margin-bottom: 10px;
}
</style>
