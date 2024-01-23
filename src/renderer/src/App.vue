<script setup lang="ts">
import Left from './components/Left.vue'
import Right from './components/Right.vue'
import { NConfigProvider, GlobalThemeOverrides } from 'naive-ui'

const themeOverrides: GlobalThemeOverrides = {
  common: {
    // primaryColor: '#FF0000',
    // primaryColorHover: '#FF0000'
  },
  Button: {
    // color: '#FF0000',
    // textColor: '#FF0000',
    // textColorText: '#ff0000'
  }
}
</script>

<template>
  <NConfigProvider :theme-overrides="themeOverrides" style="height: 100%">
    <div class="container">
      <Left />
      <Right />
    </div>
  </NConfigProvider>
</template>

<style lang="less" scoped>
.container {
  display: flex;
  height: 100%;
  justify-content: space-between;
}
</style>
