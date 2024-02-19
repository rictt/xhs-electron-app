<script setup lang="ts">
import AppContainer from './components/AppContainer.vue'
import { NConfigProvider, GlobalThemeOverrides, NMessageProvider } from 'naive-ui'

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
    <NMessageProvider>
      <AppContainer />
    </NMessageProvider>
  </NConfigProvider>
</template>

<style lang="less" scoped></style>
