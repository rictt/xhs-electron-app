<script setup lang="ts">
import Left from './Left.vue'
import Right from './Right.vue'
import { onMounted, ref } from 'vue'
import { useMessage } from 'naive-ui'

const leftRef = ref<InstanceType<typeof Left>>()
const rightRef = ref()

onMounted(() => {
  const message = useMessage()
  window.$message = message
})

const onAddAccount = () => {
  leftRef.value.showNewDialog()
}
</script>

<template>
  <div class="container">
    <Left ref="leftRef" />
    <Right ref="rightRef" @add-account="onAddAccount" />
  </div>
</template>

<style lang="less" scoped>
.container {
  display: flex;
  height: 100%;
  justify-content: space-between;
}
</style>
