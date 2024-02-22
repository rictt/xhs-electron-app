<script setup lang="tsx">
import {
  FormInst,
  NButton,
  NRadioGroup,
  NRadio,
  NSpace,
  NForm,
  NFormItem,
  NInput,
  NIcon,
  NModal,
  NPopconfirm,
  useMessage
} from 'naive-ui'
import { AddSharp, PersonAddOutline, TrainOutline } from '@vicons/ionicons5'
import { onMounted, reactive, ref, watch } from 'vue'
import { IpcChannel } from '@shared/ipc'
import { globalState } from '@renderer/store/index'
import { Edit } from '@vicons/carbon'
import { getAuthCode, setAuthCode } from '@renderer/utils'
import { Invoke } from '@renderer/utils/ipcRenderer'
// @ts-ignore: 11
import logo from '../../../../resources/icon.png?asset'
import { version } from '@shared/index'

const message = useMessage()

const newInput = ref('')

const state = reactive({
  editAuthcode: false,
  authcode: '',
  newAuthcode: '',
  // authcode: '',
  modalShow: false,
  accounts: [] as XhsAccount[],
  currentUserId: globalState.currentAccount?.user_id,
  currentAccount: null as XhsAccount | null,
  feedbackModalShow: false
})

const formRef = ref<FormInst | null>(null)
const form = reactive({
  loading: false,
  value: {
    accountId: '',
    baseCookie: '',
    creatorCookie: ''
  },
  rules: {
    baseCookie: {
      required: true,
      message: '不能为空',
      trigger: 'blur'
    }
    // creatorCookie: {
    //   required: true,
    //   message: '不能为空',
    //   trigger: 'blur'
    // }
  }
})

const showNewDialog = () => {
  state.modalShow = true
}

const handleValidateClick = () => {
  formRef.value.validate(async (errors) => {
    if (errors) {
      console.log(errors)
      message.error('Invalid')
      return
    }
    console.log(form.value)
    form.loading = true
    const data = await Invoke(IpcChannel.ValidXhsCookie, {
      ...form.value
    })
      .catch((error) => {
        console.log('error or: ', error)
        message.error('校验失败，请联系客服')
      })
      .finally(() => {
        form.loading = false
      })

    if (data && data.user_id) {
      form.loading = true
      try {
        const action = form.value.accountId ? IpcChannel.UpdateAccount : IpcChannel.AddAccount
        await Invoke(action, {
          ...data,
          user_id: data.user_id || form.value.accountId || '',
          baseCookie: form.value.baseCookie,
          creatorCookie: form.value.creatorCookie
        })
        setTimeout(() => {
          state.modalShow = false
          form.value.baseCookie = ''
          form.value.creatorCookie = ''
        }, 500)
        message.success('操作成功')
        state.accounts = await getAccounts()
      } catch (error) {
        message.error('操作失败')
      } finally {
        form.loading = false
      }
    }
  })
}

const showEditDialog = (item: XhsAccount) => {
  state.modalShow = true
  form.value.baseCookie = item.baseCookie
  form.value.creatorCookie = item.creatorCookie
  form.value.accountId = item.user_id
}

const onModalVisibleChange = (value: boolean) => {
  if (!value) {
    form.value.baseCookie = ''
    form.value.creatorCookie = ''
    form.value.accountId = ''
  }
}

watch(
  () => state.modalShow,
  (value, _newValue) => {
    onModalVisibleChange(value)
  }
)

const checkoutAccount = (account: XhsAccount) => {
  globalState.currentAccount = account
  globalState.activeComponetName = ''
  state.currentUserId = account.user_id
}

const getAccounts = async () => {
  return await Invoke(IpcChannel.GetAccountList)
}

const showManagePage = (name: string) => {
  globalState.activeComponetName = name as any
}

const editNew = () => {
  state.editAuthcode = true
  console.log(newInput.value)
  setTimeout(() => {
    // @ts-ignore: 11
    newInput.value.focus()
  })
}
const onCodeBlurChange = async () => {
  state.editAuthcode = false
  if (state.newAuthcode) {
    state.authcode = state.newAuthcode
    state.newAuthcode = ''
    setAuthCode(state.authcode)
    await Invoke(IpcChannel.SetAuthCode, state.authcode)
    window.location.reload()
  }
}

const showRemove = async (account: XhsAccount) => {
  await Invoke(IpcChannel.RemoveAccount, account.user_id)
  const list = await getAccounts()
  state.accounts = list
}

onMounted(async () => {
  const list = await getAccounts()
  state.accounts = list
  globalState.accountList = list
  if (list?.length) {
    globalState.currentAccount = list[0]
    state.currentUserId = list[0].user_id
  }
  const code = getAuthCode()
  if (code) {
    state.authcode = code
  }
})

defineExpose({
  showNewDialog
})
</script>
<template>
  <div class="left-container">
    <div class="account">
      <img class="avatar" :src="logo" />
      <h3 style="user-select: none; color: white; margin: 6px 0">xFox助手</h3>
      <div v-show="state.authcode && !state.editAuthcode" class="account-id">
        <span>授权码：</span>
        <span>{{ state.authcode }}</span>
        <NIcon style="margin: 0 4px; cursor: pointer" @click="editNew">
          <Edit color="#36ad6a" />
        </NIcon>
      </div>
      <div v-show="!state.authcode || state.editAuthcode" class="account-id">
        授权码：
        <NInput ref="newInput" v-model:value="state.newAuthcode" placeholder="填写授权码" @blur="onCodeBlurChange" />
      </div>
    </div>
    <n-radio-group v-model:value="state.currentUserId" style="width: 100%">
      <div class="xhs-list">
        <div v-for="account in state.accounts" :key="account.user_id" class="xhs-item"
          :class="{ active: globalState.currentAccount?.user_id === account.user_id }"
          @click.stop="checkoutAccount(account)">
          <n-radio style="margin-right: 10px" :value="account.user_id"></n-radio>
          <img class="xhs-avatar" :src="account.images" />
          <div class="xhs-info">
            <div class="info-nickname">{{ account.nickname }}</div>
            <div class="info-status">
            </div>
          </div>
          <div class="btn-operate">
            <NButton text type="primary" size="small" @click="showEditDialog(account)">编辑</NButton>
            <n-popconfirm :negative-text="null" positive-text="确认" @positive-click="showRemove(account)">
              <template #trigger>
                <n-button style="margin: 0 4px" text type="error" size="small">删除</n-button>
              </template>
              请确认是否删除该账号
            </n-popconfirm>
          </div>
        </div>
      </div>
    </n-radio-group>

    <div class="operate">
      <NButton type="primary" dashed @click="showNewDialog">
        <template #icon>
          <PersonAddOutline />
        </template>
        添加新账号
      </NButton>
      <NButton type="warning" dashed @click="showManagePage('LikeComment')">
        <template #icon>
          <TrainOutline />
        </template>
        批量点赞/评论
      </NButton>
      <NButton type="primary" @click="showManagePage('Publish')">
        <template #icon>
          <AddSharp />
        </template>
        管理作品
      </NButton>
    </div>

    <div class="others">
      <NSpace>
        <NButton tag="a" href="https://www.mubu.com/doc/4hiwQj9-Y-f" target="_blank" text size="large" type="primary">使用教程
        </NButton>
        <NButton text size="large" type="primary" @click="state.feedbackModalShow = true">关于软件</NButton>
      </NSpace>
      <NSpace>
        <NButton text size="large" type="primary">版本：v{{ version }}</NButton>
      </NSpace>
    </div>

    <NModal v-model:show="state.modalShow" to="body" :mask-closable="false" :close-on-esc="false" preset="card" title="操作"
      style="width: 500px">
      <n-form ref="formRef" :label-width="80" :model="form.value" :rules="form.rules">
        <n-form-item v-if="form.value.accountId" label="账号ID" path="value.accountId" required>
          <n-input v-model:value="form.value.accountId" placeholder="可以忽略" :disabled="true" />
        </n-form-item>
        <n-form-item label="主站Cookie" path="baseCookie" required>
          <n-input v-model:value="form.value.baseCookie" placeholder="请输入" />
        </n-form-item>
        <n-form-item label="发布Cookie" path="creatorCookie">
          <n-input v-model:value="form.value.creatorCookie" placeholder="请输入" />
        </n-form-item>
        <n-form-item>
          <div style="width: 100%; text-align: right">
            <n-space style="justify-content: flex-end">
              <n-button @click="state.modalShow = false">取消</n-button>
              <n-button :loading="form.loading" type="primary" attr-type="button"
                @click="handleValidateClick">验证</n-button>
            </n-space>
          </div>
        </n-form-item>
      </n-form>
    </NModal>

    <NModal v-model:show="state.feedbackModalShow" to="body" preset="card" title="关于软件" style="width: 600px">
      <div style="line-height: 2">
        <h4>作者声明：没有在任何平台进行代码售卖，请谨慎鉴别，上当受骗作者一律不负责</h4>
        <h4>
          本项目仅供学习交流，严禁用于任何商业和非法用途，非本人使用而产生的纠纷与一切后果均与本人无关。
        </h4>
      </div>
    </NModal>
  </div>
</template>

<style lang="less" scoped>
.left-container {
  display: flex;
  flex-direction: column;
  width: 240px;
  height: 100%;
  background-color: #2f3241;
}

.account {
  padding: 10px;
  text-align: center;

  .avatar {
    display: block;
    width: 80px;
    height: 80px;
    margin: 0 auto;
    border-radius: 50%;
    padding: 6px;
    object-fit: contain;
    background-color: #fff;
  }

  .account-id {
    display: flex;
    justify-content: center;
    align-items: center;
    white-space: nowrap;
    padding: 10px 0;
    color: #fff;
    font-weight: normal;
    font-size: 14px;
  }
}

.xhs-list {
  margin: 0 10px;
  background-color: #fff;
  color: #565656;
  border-radius: 10px;
  overflow: hidden;
}

.xhs-item {
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 13px;
  padding: 10px;
  border-bottom: 1px solid #f2f2f2;
  padding-bottom: 10px;
  transition: all 0.3s;
  user-select: none;

  &:hover {
    background-color: #f1f1f1;

    .btn-operate {
      display: block;
    }
  }

  .btn-operate {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    display: none;
  }

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }

  &.active {
    background-color: #e5e5e5;
  }

  .xhs-avatar {
    width: 36px;
    height: 36px;
    margin-right: 10px;
    border-radius: 50%;
    border: 1px solid #ddd;
  }

  .xhs-info {
    flex: 1;
    color: #000;

    .info-status {
      display: flex;
      width: 100%;
      color: #999;
      padding-top: 4px;

      .status {
        font-size: 12px;
        flex: 1;
        position: relative;
        padding-left: 10px;

        &::before {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
      }

      .normal-status {
        &::before {
          background-color: #43f943;
        }
      }

      .unnormal-status {
        &::before {
          background-color: #f93a3a;
        }
      }
    }
  }
}

.operate {
  display: flex;
  align-items: center;
  flex-direction: column;
  margin: 30px 0;
  padding: 0 20px;
  row-gap: 10px;

  .n-button {
    width: 100%;
  }
}

.others {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: 20px 10px;
}
</style>
