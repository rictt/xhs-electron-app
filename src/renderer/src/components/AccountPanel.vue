<script setup lang="ts">
import { onMounted, reactive, provide } from 'vue'
import { NResult, NTabs, NTabPane } from 'naive-ui'
import Notes from './Notes.vue'

type PanelProps = {
  account: XhsAccount | null
}
const props = defineProps<PanelProps>()
provide<XhsAccount>('account', props.account)

const state = reactive({
  tabs: [
    { name: 'Notes', label: '笔记列表' },
    // { name: 'Fans', label: '粉丝列表' },
    // { name: 'CareList', label: '我关注的' }
  ],
  currentTab: 'Notes'
})

const components = {
  Notes: Notes
}

onMounted(() => {
  console.log('mounted!!')
})
</script>

<template>
  <n-tabs v-model:value="state.currentTab" type="card" animated>
    <h3>currentTab: {{ state.currentTab }}</h3>
    <n-tab-pane
      v-for="item in state.tabs"
      :key="item.name"
      :name="item.name"
      :tab="item.label"
      display-directive="show:lazy"
    >
      <n-result
        v-if="!props.account"
        style="
          min-height: 400px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        "
        status="418"
        title="选择左边账号"
        description="元！启动！！"
      ></n-result>
      <keep-alive>
        <component :is="components[state.currentTab]" />
      </keep-alive>
      <div v-if="props.account && !components[state.currentTab]">开发中...</div>
    </n-tab-pane>
  </n-tabs>
</template>

<style lang="less" scoped></style>
