import { systemDb } from '@main/lowdb'
import { TaskScheduling } from '@shared/TaskSceduling'

const instances: TaskScheduling[] = []

export function getTaskInstance(articleId: string) {
  return instances.find((e) => e.key === articleId)
}

export async function removeTaskInstance(articleId: string) {
  const index = instances.findIndex((e) => e.key === articleId)
  if (index !== -1) {
    instances[index] = null
    instances.splice(index, 1)
    await systemDb.updateArticle(articleId, 'taskOps', null)
  }
}

export async function createTaskScheduleInst(articleId: string, opts: TaskSchedulingOps) {
  const target = instances.find((e) => e.key === articleId)
  if (target) {
    return target
  }

  opts.key = articleId
  const instance = new TaskScheduling(opts)
  instance.on('end', () => {
    console.log('执行完毕，清除定时发布任务')
    removeTaskInstance(articleId)
  })
  instance.start()
  instances.push(instance)
  await systemDb.updateArticle(articleId, 'taskOps', opts)
  console.log(instances)
  return instance
}
