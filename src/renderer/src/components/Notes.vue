<script setup lang="tsx">
import { NButton, NDataTable } from 'naive-ui'
import { reactive } from 'vue'

const createColumns = () => {
  return [
    {
      title: '笔记名称',
      key: 'title',
      render: (row) => {
        return (
          <NButton text tag="a" href={row.noteHref} target="_blank">
            {row.title}
          </NButton>
        )
      }
    },
    {
      title: '点赞数量',
      key: 'count',
      render: (row) => {
        return row.count
      }
    },
    {
      title: '操作',
      key: 'operator',
      render: (row: NoteType) => {
        return (
          <>
            {row.status === 'idle' ? (
              <NButton type="primary">自动回复</NButton>
            ) : (
              <NButton>取消自动回复</NButton>
            )}
          </>
        )
      }
    }
  ]
}

type NoteType = {
  noteHref: string
  title: string
  count: string
  cover: string
  status: 'monitor' | 'idle'
}

const state = reactive({
  tableData: [
    {
      noteHref: 'https://www.xiaohongshu.com/explore/657055250000000009026490',
      title: '嘎嘎好吃好做的家常菜！',
      count: '2',
      status: 'idle',
      cover:
        'https://sns-webpic-qc.xhscdn.com/202401231203/61a84fc783729605b383da0fef9e8af5/1040g2sg30s4tinanis6g5oeuc0d417n9h94l8j8!nc_n_webp_mw_1'
    }
  ] as NoteType[],
  tableColumns: createColumns(),
  pagination: {
    pageSize: 10
  }
})
</script>

<template>
  <div>
    <n-data-table
      bordered
      :columns="state.tableColumns"
      :data="state.tableData"
      :pagination="state.pagination"
    />
  </div>
</template>

<style lang="less" scoped></style>
