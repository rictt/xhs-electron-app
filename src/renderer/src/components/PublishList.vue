<script setup lang="tsx">
import {
  NButton,
  NModal,
  NForm,
  NFormItem,
  NDataTable,
  NSpin,
  NInput,
  DataTableColumn,
  NSpace,
  FormInst,
  NDatePicker,
  useMessage,
  FormRules
} from 'naive-ui'
import { onMounted, reactive, watch } from 'vue'
import { RefreshSharp } from '@vicons/ionicons5'
import { IpcChannel } from '@shared/ipc'
import ImageList from './ImageList.vue'
import { requireNativeImage } from '@renderer/utils'
import { toRaw, ref } from 'vue'
import { Invoke } from '@renderer/utils/ipcRenderer'

const formRef = ref<FormInst | null>(null)
const removePublish = async (row) => {
  await Invoke(IpcChannel.RemovePublish, toRaw(row))
  await getList()
}
const message = useMessage()

const setAutuPublish = async (row) => {
  state.currentRowId = row.id
  console.log(row)
  state.modalShow = true
}

const stopAutuPublish = async (row) => {
  state.loading = true
  try {
    await Invoke(IpcChannel.StopAutoPublish, row.id + '')
    await getList()
  } catch (error) {
    console.log(error)
  } finally {
    state.loading = false
  }
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
        return (
          <div style="max-height: 100px; overflow: hidden;">
            <ImageList model-value={row.pictures?.map((e) => requireNativeImage(e))} />
          </div>
        )
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
      title: '定时配置',
      key: 'taskOps',
      width: 100,
      align: 'center',
      render: (row) => {
        // return new Date(row.create_time).toLocaleString()
        if (row.taskOps) {
          return (
            <NButton text type="primary">
              查看配置
            </NButton>
          )
        }
        return '-'
      }
    },
    {
      title: '操作',
      key: 'operator',
      width: 140,
      render: (row: ArticleDataItem) => {
        // <NButton size="small" text type="primary" onClick={() => editPublish(row)}>
        //   编辑
        // </NButton>
        return (
          <NSpace>
            {!row.taskOps ? (
              <NButton size="small" text type="primary" onClick={() => setAutuPublish(row)}>
                自动发布
              </NButton>
            ) : (
              <NButton size="small" text type="primary" onClick={() => stopAutuPublish(row)}>
                取消自动发布
              </NButton>
            )}
            <NButton size="small" text type="error" onClick={() => removePublish(row)}>
              删除
            </NButton>
          </NSpace>
        )
      }
    }
  ] as DataTableColumn[]
}
const state = reactive({
  modalShow: false,
  modalLoading: false,
  loading: false,
  tableData: [],
  pagination: {
    pageSize: 10
  },
  currentRowId: undefined,
  tableColumns: createColumns()
})
const formValue = reactive({
  startTime: undefined,
  endTime: undefined,
  times: undefined,
  interval: undefined,
  loading: false
})
const formRules = reactive<FormRules>({
  startTime: {
    required: true,
    message: '不能为空',
    trigger: 'blur',
    type: 'number'
  },
  endTime: {
    trigger: ['blur', 'change'],
    validator: (rule, value, callback) => {
      if (value && value < Date.now()) {
        callback('结束时间不能当前时间')
        return false
      }
      return true
    }
  },
  times: {
    trigger: ['blur', 'change'],
    validator: (rule, value, callback) => {
      if (!formValue.endTime && !value) {
        callback('结束时间为空时：执行次数不能为空或者小于等于0')
        return false
      }
      return true
    }
  },
  interval: {
    trigger: ['blur', 'change'],
    validator: (rule, value, callback) => {
      if (!formValue.endTime) {
        if (formValue.times > 1 && !value) {
          callback('间隔不能为空')
          return false
        } else if (!formValue.times && !value) {
          callback('间隔不能为空')
          return false
        }
      }
      return true
    }
  }
})

const handleValidateClick = () => {
  formRef.value?.validate(async (errors) => {
    if (errors) {
      message.error('Invalid')
      return
    }
    if (state.currentRowId) {
      const rowIndex = state.tableData.findIndex((e) => e.id === state.currentRowId)
      if (rowIndex >= 0) {
        const row = state.tableData[rowIndex] as ArticleDataItem
        const ops: TaskSchedulingOps = {
          startTime: formValue.startTime,
          endTime: formValue.endTime,
          times: formValue.times ? parseInt(formValue.times) : undefined,
          interval: formValue.interval ? parseInt(formValue.interval) * 1000 : undefined,
          key: state.currentRowId,
          task: () => {}
        }
        // row.taskOps = ops
        state.modalShow = false
        formValue.startTime = undefined
        formValue.endTime = undefined
        formValue.times = undefined
        formValue.interval = undefined
        row.isPublic = row.isPublic || false
        console.log(row)
        // await Invoke(IpcChannel.UpdateArticle, 'taskOps', toRaw(row.taskOps))
        console.log('article row: ', row, toRaw(row), ops)
        delete ops.task
        state.modalLoading = true
        await Invoke(
          IpcChannel.StartAutoPublish,
          JSON.parse(JSON.stringify(row)),
          JSON.parse(JSON.stringify(ops))
        )
        await getList()
        try {
          await getList()
        } catch (error) {
          console.log('error: ', error)
        }
        console.log('success!')
        state.modalLoading = false
      }
    }
  })
}

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

watch(
  () => formValue.times,
  (value) => {
    if (value <= 1) {
      formValue.interval = undefined
    }
  }
)

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

  <NModal
    v-model:show="state.modalShow"
    to="body"
    :mask-closable="false"
    :close-on-esc="false"
    preset="card"
    title="操作"
    style="width: 500px"
  >
    <n-form
      ref="formRef"
      label-placement="left"
      label-width="auto"
      :model="formValue"
      :rules="formRules"
    >
      <div>{{ formValue }}</div>
      <n-form-item label="开始时间" path="startTime" required>
        <n-date-picker
          v-model:value="formValue.startTime"
          type="datetime"
          clearable
          placeholder="请输入开始时间"
        />
      </n-form-item>
      <n-form-item label="结束时间" path="endTime">
        <n-date-picker
          v-model:value="formValue.endTime"
          type="datetime"
          clearable
          placeholder="请输入结束时间"
        />
      </n-form-item>
      <n-form-item label="执行次数" path="times">
        <n-input v-model:value="formValue.times" placeholder="请输入执行次数" />
      </n-form-item>
      <n-form-item
        v-if="formValue.times > 1 || (formValue.endTime && !formValue.times)"
        label="间隔(秒）"
        path="interval"
      >
        <n-input
          v-model:value="formValue.interval"
          placeholder="请输入执行间隔，比如输入1（即1秒执行一次"
        />
      </n-form-item>
      <n-form-item>
        <div style="width: 100%; text-align: right">
          <n-space style="justify-content: flex-end">
            <n-button @click="state.modalShow = false">取消</n-button>
            <n-button
              :loading="state.modalLoading"
              type="primary"
              attr-type="button"
              @click="handleValidateClick"
              >保存</n-button
            >
          </n-space>
        </div>
      </n-form-item>
    </n-form>
  </NModal>
</template>

<style lang="less" scoped></style>
