<script setup lang="tsx">
import { FormInst, NButton, NSpace, NForm, NFormItem, NInput, NModal, useMessage } from 'naive-ui'
import { AddSharp } from '@vicons/ionicons5'
import { onMounted, reactive, ref, watch } from 'vue'
import { IpcChannel } from '@shared/ipc'

const message = useMessage()

const state = reactive({
  modalShow: false,
  accounts: [] as XhsAccount[]
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
    },
    creatorCookie: {
      required: true,
      message: '不能为空',
      trigger: 'blur'
    }
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
    const data = await window.electron.ipcRenderer
      .invoke(IpcChannel.ValidXhsCookie, {
        ...form.value
      })
      .catch((error) => {
        console.log('error or: ', error)
        message.error('校验失败，请联系客服\n' + JSON.stringify(error))
      })
      .finally(() => {
        form.loading = false
      })

    if (data && data.user_id) {
      form.loading = true
      try {
        const action = form.value.accountId ? IpcChannel.UpdateAccount : IpcChannel.AddAccount
        await window.electron.ipcRenderer.invoke(action, {
          ...data,
          user_id: form.value.accountId || '',
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

const getAccounts = async () => {
  return await window.electron.ipcRenderer.invoke(IpcChannel.GetAccountList)
}

onMounted(async () => {
  const list = await getAccounts()
  console.log('accounts: ', list)
  state.accounts = list
})
</script>
<template>
  <div class="left-container">
    <div class="account">
      <img
        class="avatar"
        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMkAAABICAMAAABr9CFKAAAAP1BMVEUAAAD/I0L/JEL/JEH/JED/IED/JEH/JUL/JEL/I0H/IED/I0L/JEH/JUD/JEH/I0L/I0D/JEH/I0P/JEP/JEKyzp5HAAAAFHRSTlMA34BgQB+/n++gEJCwMHCfUM9Qz4ilXboAAAQzSURBVGje1ZrrtqMgDIW5S/HSm+//rLNmbFdNNybUg0zP/nd6DOaTkEBUbSr5lZIq1BRWGtROuXkt9UPZeaVQaqXXVt0vJiFGs/9Ckuu+KflCEl1mcyMeuF9MErYi8j5z6tUiP7O6B+MUle/jPOvO1yRBTyyJOk4dsWeljV/7GB+/3iqTnMHkxySoaDLBHMd6JDgllUhQ2uOooSpJTyxSPRJEQQ9dNRJMwZVJ8DEN659MLRKsikeSzANkyq4WCU7JoSSzeyfpK5HglBxMEt5JLpVIsCoeQkIfVRAdlEnkFHw4yURJbCUSrIqHkwyExNSr8R5cO5hEr0jCs5hczEo3nmTs1kr5KZnjZF/6N5hZFCjB2z3T0+RELjOLek1uoZRbLr74/FrtBBLIUMzTxMVvIJUW7+rxVxTmZSTJuzyChyhXhQRj1EslzfAkKe+KZuK5IUmE/MmseEi25FqUbUlCzC4Cic65GeQpaU/iPiEx4no3LUiYRYwkbHqYmE1FKxI08wLJKZOyT0zN+38k6hOSgR4WUb4VCbocGRL0JWRuDKTtSCZwmSGBq9nC6OqSRJYEnzKSyIA28ClYJjF6pUiHeert1xB6S3j6IhJx8+P/CapsKclp3qe73Rij40hwC5n4o8ABJCjtshXCSE55JjfBDuAQEpTZQQI7ArY0HUeCKPgcRRJuJZwhUA8kQT9gcJ4EwZnIa0USE0NikARfhRhuShqSzAYfpEgy5Dt/MJJrShJhlSaWBJM282ayKck8QqnjSLCQDkwKbksyba9sU/L7lWkMtyXp37aEV5EEyfNdCd0tmhqRdG9DBJnklj8EKLe7I4Htw4E6mdGgsa1GrAaZZNxYV+dDOxIoGykJHMxFEv9RF9IeRqIcSzLJJCrfwJiO7kjIb2wijJ0jEZPt/diOBApWOBRGkeSUC8fETEkjkjOkIolkIhaJI+lUQ5JI/pRI8DYXrqHqWpIYWPASSSL/8Ew5uaqWJB6GlkhUyMaP05iCW5IQv6IqIjEbS3q0hkq1JCFWQxmJK/1AsCkJCRYrkGBFGb+KxEGoSCTmZf5VJEpDqAgkI0ziZfwKkgkGFkhUwDfCMfSTpUoPt+xLAz0dwdUfkQxAkiJ4K3y+cSFTQq4FG68Lv3n4lMRnirpZ+eXtojPcB9a8TopzdsIz5n4SPI/1cD55TopmzhmwtO3W5xRYanRNErNpH15r5wYVnHs5dV1cZZztgLICSYpMR+Jh2cEo7PeSrvKUyCTYo8rvZLXPtbCZCtiXTkldEieZu5GNRa1Qt6IpCVVJcEAMGj4WbekHkPhWuDaJy1vLjUL5izvHhe25Bgnmmnz0o1IRcFFVnOuTTEwvCnQqAuGctUBZjQSDX49FARNNUpx6dkqqkmDwyw4OcXmhf+1sUry8DZsZot9LMuq1FFW6/vV/8XDonXroDwd3OfCOVCS+AAAAAElFTkSuQmCC"
      />
      <div class="account-id">账号ID：819221812</div>
    </div>
    <div class="xhs-list">
      <div class="xhs-item active">
        <img
          class="xhs-avatar"
          src="https://sns-avatar-qc.xhscdn.com/avatar/61727ede1f4003dc393c64fa.jpg?imageView2/2/w/120/format/jpg"
        />
        <div class="xhs-info">
          <div class="info-nickname">爱做饭的程序员</div>
          <div class="info-status">
            <!-- <div class="normal-status">账号正常</div> -->
            <div class="status unnormal-status">已离线</div>
          </div>
        </div>
      </div>
      <div v-for="account in state.accounts" :key="account.user_id" class="xhs-item">
        <img class="xhs-avatar" :src="account.images" />
        <div class="xhs-info">
          <div class="info-nickname">{{ account.nickname }}</div>
          <div class="info-status">
            <div class="status normal-status">账号正常</div>
            <div class="status unnormal-status">已离线</div>
          </div>
        </div>
        <div class="btn-operate">
          <NButton text type="primary" size="small" @click="showEditDialog(account)">编辑</NButton>
        </div>
      </div>
    </div>

    <div class="operate">
      <NButton type="primary" @click="showNewDialog">
        <template #icon>
          <AddSharp />
        </template>
        添加新账号
      </NButton>
    </div>

    <NModal
      v-model:show="state.modalShow"
      :mask-closable="false"
      :close-on-esc="false"
      preset="card"
      title="操作"
      style="width: 500px"
    >
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
              <n-button
                :loading="form.loading"
                type="primary"
                attr-type="button"
                @click="handleValidateClick"
                >验证</n-button
              >
            </n-space>
          </div>
        </n-form-item>
      </n-form>
    </NModal>
  </div>
</template>

<style lang="less" scoped>
.left-container {
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
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 13px;
  padding: 10px;
  border-bottom: 1px solid #f2f2f2;
  padding-bottom: 10px;

  &:hover {
    .btn-operate {
      display: block;
    }
  }

  .btn-operate {
    display: none;
  }

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }

  &.active {
    background-color: #ddd;
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
}
</style>
