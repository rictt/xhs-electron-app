<script setup lang="ts">
import Left from './Left.vue'
import Right from './Right.vue'
import { onMounted } from 'vue'
import { useMessage } from 'naive-ui'

onMounted(() => {
  const message = useMessage()
  window.$message = message
})
</script>

<template>
  <div class="container">
    <Left />
    <Right />
  </div>
</template>

<style lang="less" scoped>
.container {
  display: flex;
  height: 100%;
  justify-content: space-between;
}
</style>
