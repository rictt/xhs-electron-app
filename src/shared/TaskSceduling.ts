export const TaskSchedulingInstances = []

export class TaskScheduling {
  // 时间戳
  startTime: number
  endTime?: number
  // 0等于不限次数
  times?: number = 0
  runTimes: number
  // 毫秒数
  interval?: number = 0
  isRunNow?: boolean = true
  startTimer?: string | number | NodeJS.Timeout
  timer?: string | number | NodeJS.Timeout
  key?: string | number
  callbacks: { name: string; handler: () => void }[]

  task: (now: number) => any

  constructor(ops: TaskSchedulingOps) {
    const { startTime, endTime, times, interval, isRunNow, task, key } = ops
    this.startTime = startTime
    this.endTime = endTime
    this.times = times || 0
    this.interval = interval || 0
    this.isRunNow = isRunNow
    this.runTimes = 0
    this.key = key
    this.callbacks = []
    this.task = task
    this.execute = this.execute.bind(this)
    this.start = this.start.bind(this)
    TaskSchedulingInstances.push(this)
  }

  on(name, handler) {
    this.callbacks.push({ name, handler })
  }

  emit(name, ...args) {
    const list = this.callbacks.filter((e) => e.name === name).map((e) => e.handler)
    list.forEach((handler) => {
      // @ts-ignore: any
      handler(...args)
    })
  }

  start() {
    const { startTime, endTime, times, interval } = this
    // 设置了开始时间、结束时间、间隔、则忽略执行次数
    // if (startTime && endTime && interval) {
    //   this.unitTime(startTime, this.execute)
    // } else if (startTime && !endTime && times && interval) {
    //   // 设置了开始时间、次数、间隔，并且结束时间空
    //   this.unitTime(startTime, this.execute)
    // } else if (startTime && times === 1 && !interval) {
    //   this.unitTime(startTime, this.execute)
    // }
    this.untilTime(startTime, this.execute)
  }

  untilTime(time: number, callback, timeout = 0) {
    this.startTimer = setTimeout(() => {
      if (time <= Date.now()) {
        callback()
      } else {
        this.untilTime(time, callback, 1000)
      }
    }, timeout)
  }

  checkCanExecute() {
    const { startTime, endTime, times, runTimes } = this
    if (startTime > Date.now()) {
      console.log('还没到开始时间，不执行')
      return false
    }
    if (endTime && endTime < Date.now()) {
      console.log('已经超过结束时间，不执行')
      this.emit('end')
      return false
    }
    if (times && runTimes >= times) {
      console.log('执行次数超过了，不执行')
      this.emit('end')
      return false
    }

    return true
  }

  stop() {
    this.runTimes = 1000000
    clearTimeout(this.timer)
    this.timer = null
  }

  execute() {
    if (this.checkCanExecute()) {
      this.task(Date.now())
      this.runTimes++
      clearTimeout(this.startTimer)
      clearTimeout(this.timer)
      this.timer = null
      this.timer = setTimeout(this.execute, this.interval)
    }
  }
}
