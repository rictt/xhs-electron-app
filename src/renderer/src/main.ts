import { createApp } from 'vue'
import App from './App.vue'
import './assets/css/global.less'
import 'vfonts/Lato.css'
import 'vfonts/FiraCode.css'
import { TaskScheduling } from '@shared/TaskSceduling'

createApp(App).mount('#app')

let index = 0
const startT = Date.now() + 1000 * 5
console.log('执行时间：', new Date(startT).toLocaleString())

const ts = new TaskScheduling({
  startTime: startT,
  endTime: startT + 1000 * 20,
  // isRunNow: false,
  times: 5,
  interval: 1000,
  task: (now: number) => {
    index++
    console.log(new Date(now).toLocaleTimeString(), ts.runTimes)
  }
})

// ts.start()
