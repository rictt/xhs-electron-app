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
  NCard
} from 'naive-ui'
import { onMounted, reactive, ref, toRaw } from 'vue'
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
  title: {
    required: true,
    message: '请输入标题',
    trigger: 'blur'
  },
  desc: {
    required: true,
    message: '请输入描述',
    trigger: ['input', 'blur']
  },
  accounts: {
    required: true,
    type: 'array',
    message: '请选择账号',
    trigger: ['input', 'blur']
  },
  pictures: {
    required: true,
    type: 'array',
    message: '请选择图片',
    trigger: ['input', 'blur']
  }
})
const formValue = reactive({
  title: '',
  desc: '',
  // pictures: [],
  pictures: [],
  accounts: [],
  topics: [],
  topicText: '',
  isPublic: true
})
const message = useMessage()
const formRef = ref<FormInst | null>(null)

const validate = async () => {
  return new Promise((resolve, reject) => {
    formRef.value?.validate(async (errors) => {
      if (errors) {
        console.log(errors)
        message.error('Invalid')
        reject(errors)
        return
      }
      resolve('')
    })
  })
}

const createFormList = () => {
  const list = formValue.accounts
    .map((item) => {
      return getFormValue(item)
    })
    .filter((e) => e.account)

  return list
}

const getFormValue = (userId) => {
  const data = {
    ...formValue,
    account: globalState.accountList.find((e) => e.user_id === userId || e.user_id === props.userId)
  }
  Object.keys(data).forEach((key) => {
    data[key] = toRaw(data[key])
  })
  data.topics = [...(data.topics || [])]
  data.pictures = [...data.pictures]
  delete data.accounts
  delete data.topicText
  return data
}

const selectImgFiles = async () => {
  const filePaths = await Invoke(IpcChannel.ShowOpenDialogSync, {
    title: '选择图片',
    filters: [{ name: 'Images', extensions: ['jpg', 'png', 'jpeg'] }],
    properties: ['openFile', 'multiSelections']
  } as OpenDialogOptions)
  if (filePaths && filePaths.length) {
    console.log('filePaths: ', filePaths)

    const nativeImages = filePaths.map((e) => {
      return requireNativeImage(e)
    })
    formValue.pictures = [...formValue.pictures, ...nativeImages]
  }
}

const handleClose = (index) => {
  formValue.topics.splice(index, 1)
}

const handleEnter = (e) => {
  if (e.isComposing) return
  if (formValue.topicText) {
    const text = formValue.topicText.replace(/#?\s*/g, '')
    if (!formValue.topics.includes(text)) {
      formValue.topics.push(text)
      formValue.topicText = ''
    }
  }
}

onMounted(() => {
  console.log('form: ', props.form)
  if (props.form) {
    Object.keys(props.form).forEach((key) => {
      formValue[key] = props.form[key]
    })
  }
})

defineExpose({
  validate,
  createFormList,
  getFormValue
})
</script>

<template>
  <n-form ref="formRef" label-placement="left" :label-width="100" :model="formValue" :rules="rules">
    <n-form-item label="标题" path="title">
      <n-input v-model:value="formValue.title" placeholder="输入标题" />
    </n-form-item>
    <n-form-item label="描述" path="desc">
      <n-input v-model:value="formValue.desc" type="textarea" placeholder="输入描述" />
    </n-form-item>

    <n-form-item label="图片" path="pictures">
      <div style="">
        <ImageList
          v-model:model-value="formValue.pictures"
          :remove="props.isBatch"
          style="margin-bottom: 10px"
        />
        <NButton @click="selectImgFiles">点击上传</NButton>
      </div>
    </n-form-item>

    <n-form-item label="话题" path="topics">
      <div>
        <n-tag
          v-for="(tag, index) in formValue.topics"
          :key="tag"
          style="margin-right: 10px; margin-bottom: 10px"
          type="success"
          closable
          @close="handleClose(index)"
        >
          {{ tag }}
        </n-tag>
        <n-input-group style="width: 100%; margin: 10px 0">
          <n-input
            v-model:value="formValue.topicText"
            placeholder="请输入话题（不需要带#）"
            @keydown.enter="handleEnter"
          />
          <n-button type="primary" @click="handleEnter">提交</n-button>
        </n-input-group>
      </div>
    </n-form-item>

    <n-form-item label="权限设置" path="isPublic" required>
      <n-radio-group v-model:value="formValue.isPublic" name="radiogroup">
        <n-space>
          <n-radio :value="true">公开（所有人可见）</n-radio>
          <n-radio :value="false">私密（仅自己可见）</n-radio>
        </n-space>
      </n-radio-group>
    </n-form-item>

    <n-form-item v-if="props.isBatch" label="发布账号" path="accounts">
      <n-checkbox-group v-model:value="formValue.accounts">
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
  </n-form>
</template>

<style lang="less" scoped></style>
