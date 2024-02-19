import { AuthList, IpcChannel } from '@shared/ipc'
import { getAuthCode } from './index'

export async function Invoke(channel: string, ...args: any[]) {
  if (AuthList.includes(channel)) {
    const response = await window.electron.ipcRenderer.invoke(IpcChannel.Auth, getAuthCode())
    if (!response || !response.data) {
      return window.$message.error('请检查授权码是否正确/有效')
    }
  }
  const { data, success, message } = await window.electron.ipcRenderer.invoke(channel, ...args)
  // return window.electron.ipcRenderer.invoke(channel, ...args)
  console.log(data, success, message)
  if (!success) {
    const msg = message || '系统出错，请联系开发者'
    window.$message.error(msg)
    throw new Error(msg)
  }

  return data
}
