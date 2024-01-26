<script setup lang="ts">
import { NForm, NFormItem, NInput, NButton, FormInst, useMessage } from 'naive-ui'
import { reactive, ref } from 'vue'

const rules = reactive({
  user: {
    name: {
      required: true,
      message: '请输入姓名',
      trigger: 'blur'
    },
    age: {
      required: true,
      message: '请输入年龄',
      trigger: ['input', 'blur']
    }
  },
  phone: {
    required: true,
    message: '请输入电话号码',
    trigger: ['input']
  }
})

const formValue = reactive({
  user: {
    name: '',
    age: ''
  },
  phone: ''
})
const message = useMessage()
const formRef = ref<FormInst | null>(null)
const handleValidateClick = (e: MouseEvent) => {
  e.preventDefault()
  formRef.value?.validate((errors) => {
    if (!errors) {
      message.success('Valid')
    } else {
      console.log(errors)
      message.error('Invalid')
    }
  })
}
</script>

<template>
  <n-form ref="formRef" inline :label-width="80" :model="formValue" :rules="rules">
    <n-form-item label="姓名" path="user.name">
      <n-input v-model:value="formValue.user.name" placeholder="输入姓名" />
    </n-form-item>
    <n-form-item label="年龄" path="user.age">
      <n-input v-model:value="formValue.user.age" placeholder="输入年龄" />
    </n-form-item>
    <n-form-item label="电话号码" path="phone">
      <n-input v-model:value="formValue.phone" placeholder="电话号码" />
    </n-form-item>
    <n-form-item>
      <n-button attr-type="button" @click="handleValidateClick"> 验证 </n-button>
    </n-form-item>
  </n-form>
</template>

<style lang="less" scoped></style>
