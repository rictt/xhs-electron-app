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
  NCard,
  NStep,
  NSteps
} from 'naive-ui'
import PublishForm from './PublishForm.vue'
import { Component, VueElement, onMounted, reactive, ref, toRaw } from 'vue'
import { globalState } from '@renderer/store'
import { IpcChannel } from '@shared/ipc'
import ImageList from './ImageList.vue'
import { requireNativeImage, replaceNativeImageScheme } from '@renderer/utils'
import type { OpenDialogOptions } from 'electron'
import { Invoke } from '@renderer/utils/ipcRenderer'

const emits = defineEmits(['change-tab'])
const state = reactive({
  step: 1,
  batchList: [],
  loading: false
})
const formValue = reactive({
  title: '',
  desc: '',
  // pictures: [],
  pictures: [],
  accounts: [],
  isPublic: true
})
const message = useMessage()
const formRef = ref<InstanceType<typeof PublishForm>[] | []>([])
const batchFormRef = ref<InstanceType<typeof PublishForm>>(null)

const handleValidateClick = async (e: MouseEvent) => {
  e.preventDefault()
  console.log(formRef.value)
  await Promise.all(formRef.value.map((e) => e.validate()))
  const formList = formRef.value.map((e) => e.getFormValue())
  console.log('formList: ', formList)

  state.loading = true
  const list = [...formList]
  let allSuccess = true
  for (let i = 0; i < list.length; i++) {
    const params: CreateNoteForm = list[i]
    params.pictures = params.pictures.map((e) => replaceNativeImageScheme(e))
    try {
      const result: PublishResult = await Invoke(IpcChannel.NewNote, params)
      console.log('result: ', result)
      if (result.success) {
        state.batchList.splice(i, 1)
        message.success(`【${params.account.nickname}】发布成功`)
      } else {
        allSuccess = false
        message.error(`【${params.account.nickname}】发布失败：${result.message}`, {
          closable: true,
          duration: 0
        })
      }
    } catch (error) {
      allSuccess = false
      console.log(error)
      message.error(`【${params.account.nickname}】发布失败：${error}`, {
        closable: true,
        duration: 0
      })
    }
  }
  if (allSuccess) {
    state.step = 1
    emits('change-tab', 'list')
  }
  state.loading = false
  return
}
const goPrev = () => {
  state.step--
  state.loading = false
}
const goNext = () => {
  console.log(batchFormRef.value.validate)
  batchFormRef.value.validate().then(() => {
    const batchList = batchFormRef.value.createFormList()
    console.log('batch List: ', batchList)
    state.step++
    state.batchList = batchList
  })
}

onMounted(async () => {
  globalState.accountList = await Invoke(IpcChannel.GetAccountList)
})
</script>

<template>
  <n-steps style="padding: 0 10px" :current="state.step">
    <n-step title="批量设置" />
    <n-step title="发布优化" />
    <n-step title="发布" />
  </n-steps>

  <br />

  <PublishForm v-show="state.step === 1" ref="batchFormRef" :is-batch="true" />
  <n-space v-if="state.step === 2" vertical>
    <n-card
      v-for="(item, index) in state.batchList"
      :key="index"
      :title="`账号：${item.account.nickname}`"
    >
      <PublishForm ref="formRef" :form="item" :user-id="item.account.user_id" />
    </n-card>
  </n-space>

  <div style="width: 100%; display: flex; justify-content: center; margin: 20px 0">
    <n-button v-if="state.step === 2" @click="goPrev">上一步</n-button>
    <n-button v-if="state.step === 1" type="primary" @click="goNext">下一步</n-button>
    <n-button
      v-if="state.step === 2"
      type="primary"
      style="margin: 0 10px"
      :loading="state.loading"
      @click="handleValidateClick"
      >发布</n-button
    >
  </div>
</template>

<style lang="less" scoped></style>
