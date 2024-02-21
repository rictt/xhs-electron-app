<script setup lang="ts">
import {
  NForm,
  NFormItem,
  NInput,
  NButton,
  NCheckbox,
  NCheckboxGroup,
  NSpace,
  NRadioGroup,
  NRadio,
  FormInst,
  useMessage,
  FormRules,
  NTag,
  NInputGroup,
  NSpin,
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

const rules = reactive<FormRules>({
  linkText: {
    required: true,
    message: '请输入笔记链接',
    trigger: 'blur'
  }
})
const formValue = reactive({
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
const state = reactive({
  loading: false
})

const message = useMessage()
const formRef = ref<FormInst | null>(null)

const addNewComment = () => {
  if (formValue.commentText) {
    formValue.commentList.unshift(formValue.commentText)
    formValue.commentText = ''
  }
}

const onCheckboxAllChange = (value, key) => {
  formValue[key] = value ? globalState.accountList.map((e) => e.user_id) : []
}

const onCheckboxListChange = (value) => {
  if (value && value.length === globalState.accountList.length) {
    return true
  }
  return false
}

watch(
  () => formValue.likeAccountList,
  (value) => {
    formValue.isLikeAllAccount = onCheckboxListChange(value)
  }
)
watch(
  () => formValue.commentAccountList,
  (value) => {
    formValue.isCommentAllAccount = onCheckboxListChange(value)
  }
)
watch(
  () => formValue.collectAccountList,
  (value) => {
    formValue.isCollectAllAccount = onCheckboxListChange(value)
  }
)

const submit = () => {
  formRef.value.validate(async (errors) => {
    if (errors) {
      return
    }
    const { linkText, commentText, likeAccountList, collectAccountList, commentAccountList } =
      formValue
    let { commentList } = formValue
    commentList = [...commentList]
    const linkMap = {}
    const linkList = linkText
      .split('\n')
      .filter((e) => e && e.indexOf('http') !== -1)
      .filter((e) => {
        if (linkMap[e]) return false
        linkMap[e] = true
        return true
      })
    if (!linkList.length) {
      message.error('链接填写错误，一行一条笔记链接，换行输入多条，请重试')
      return
    }
    if (!likeAccountList.length && !collectAccountList.length && !commentAccountList.length) {
      message.error('点赞/收藏/评论账号不能都为空')
      return
    }
    if (!commentList.length && commentText) {
      commentList.push(commentText)
    }
    console.log(commentList)
    if (commentAccountList.length && !commentList.length) {
      message.error('评论内容不能为空，请设置！')
      return
    }
    let index = 0
    const result = []
    const accountList: XhsAccount[] = globalState.accountList.filter((e) => {
      return (
        likeAccountList.includes(e.user_id) ||
        collectAccountList.includes(e.user_id) ||
        commentAccountList.includes(e.user_id)
      )
    })
    console.log('总共需要操作的账号为：', accountList)
    const optsList: NoteOperationOps[] = []
    for (let i = 0; i < linkList.length; i++) {
      const note_link = linkList[i]
      for (let j = 0; j < accountList.length; j++) {
        const opts: NoteOperationOps = {
          note_link
        }
        const account = accountList[j]
        const isComment = commentAccountList.includes(account.user_id)
        const text = isComment ? commentList[index++] : null
        if (isComment) {
          if (index >= commentList.length) {
            index = 0
          }
        }
        opts.isLike = likeAccountList.includes(account.user_id)
        opts.isCollect = collectAccountList.includes(account.user_id)
        opts.isComment = commentAccountList.includes(account.user_id)
        opts.account = toRaw(account)
        opts.commentText = text
        optsList.push(opts)
      }
    }

    console.log('即将操作的账号配置为：', optsList)

    state.loading = true
    for (let z = 0; z < optsList.length; z++) {
      const opts = optsList[z]
      const response = await Invoke(IpcChannel.OperationNote, opts as NoteOperationOps)
      result.push(response)
    }
    state.loading = false

    console.log('处理结果： ', result)
    message.success('批量操作成功', { closable: true, duration: 1000 * 10 })

    setTimeout(async () => {
      console.log('清理实例')
      for (let i = 0; i < accountList.length; i++) {
        await Invoke(IpcChannel.ClearInstance, accountList[i].user_id)
      }
      console.log('清理结束')
    }, 3000)
  })
}

onMounted(async () => {
  globalState.accountList = await Invoke(IpcChannel.GetAccountList)
  const ids = globalState.accountList.map((e) => e.user_id)
  if (formValue.isLikeAllAccount) {
    formValue.likeAccountList = [...ids]
  }
  if (formValue.isCollectAllAccount) {
    formValue.collectAccountList = [...ids]
  }
  if (formValue.isCommentAllAccount) {
    formValue.commentAccountList = [...ids]
  }
})
</script>

<template>
  <n-spin :show="state.loading">
    <n-form
      ref="formRef"
      label-placement="left"
      :label-width="100"
      :model="formValue"
      :rules="rules"
    >
      <n-form-item label="笔记链接" path="linkText" required>
        <n-input
          v-model:value="formValue.linkText"
          type="textarea"
          rows="10"
          placeholder="一行一条笔记链接，换行输入多条笔记&#10;比如&#10;https://www.xiaohongshu.com/explore/65d55d620000000007027ed1&#10;https://www.xiaohongshu.com/explore/65d55d620000000007027ed1"
        />
      </n-form-item>
      <n-form-item label="点赞账号" path="isPublic">
        <div style="margin-top: 6px">
          <div>
            <n-checkbox
              v-model:checked="formValue.isLikeAllAccount"
              @change="onCheckboxAllChange($event, 'likeAccountList')"
              >全部</n-checkbox
            >
          </div>
          <div style="margin-top: 10px">
            <n-checkbox-group v-model:value="formValue.likeAccountList" name="radiogroup">
              <n-space>
                <n-checkbox
                  v-for="item in globalState.accountList"
                  :key="item.user_id"
                  :value="item.user_id"
                  >{{ item.nickname }}</n-checkbox
                >
              </n-space>
            </n-checkbox-group>
          </div>
        </div>
      </n-form-item>

      <n-form-item label="评论账号" path="isPublic">
        <div style="margin-top: 6px">
          <div>
            <n-checkbox
              v-model:checked="formValue.isCommentAllAccount"
              @change="onCheckboxAllChange($event, 'commentAccountList')"
              >全部</n-checkbox
            >
          </div>
          <div style="margin-top: 10px">
            <n-checkbox-group v-model:value="formValue.commentAccountList" name="radiogroup">
              <n-space>
                <n-checkbox
                  v-for="item in globalState.accountList"
                  :key="item.user_id"
                  :value="item.user_id"
                  >{{ item.nickname }}</n-checkbox
                >
              </n-space>
            </n-checkbox-group>
          </div>
        </div>
      </n-form-item>

      <n-form-item label="收藏账号" path="isPublic">
        <div style="margin-top: 6px">
          <div>
            <n-checkbox
              v-model:checked="formValue.isCollectAllAccount"
              @change="onCheckboxAllChange($event, 'collectAccountList')"
              >全部</n-checkbox
            >
          </div>
          <div style="margin-top: 10px">
            <n-checkbox-group v-model:value="formValue.collectAccountList" name="radiogroup">
              <n-space>
                <n-checkbox
                  v-for="item in globalState.accountList"
                  :key="item.user_id"
                  :value="item.user_id"
                  >{{ item.nickname }}</n-checkbox
                >
              </n-space>
            </n-checkbox-group>
          </div>
        </div>
      </n-form-item>

      <n-form-item label="评论内容">
        <div style="width: 90%; margin-top: 6px">
          <n-input
            v-model:value="formValue.commentText"
            style="width: 100%"
            type="textarea"
            placeholder="请输入评论内容"
          />
          <n-button type="primary" style="margin: 10px 0" @click="addNewComment">新增评论</n-button>
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
          </div>
        </div>
      </n-form-item>

      <n-form-item>
        <div style="width: 100%; display: flex; align-items: center; justify-content: center">
          <n-button type="primary" size="large" @click="submit">提交</n-button>
        </div>
      </n-form-item>
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
