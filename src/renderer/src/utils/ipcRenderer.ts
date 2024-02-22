import { AuthList, IpcChannel } from '@shared/ipc'
import { getAuthCode } from './index'

export async function Invoke(channel: string, ...args: any[]) {
  if (AuthList.includes(channel)) {
    const response = await window.electron.ipcRenderer.invoke(IpcChannel.Auth, getAuthCode())
    if (!response || !response.data) {
      return window.$message.error('请检查授权码是否正确/有效')
    }
  }
  console.log('args: ', args)
  const { data, success, message } = await window.electron.ipcRenderer.invoke(channel, ...args)
  // return window.electron.ipcRenderer.invoke(channel, ...args)
  console.log(data, success, message)
  if (!success) {
    const msg = extractErrorMessage(message)
    window.$message.error(msg)
    throw new Error(msg)
  }

  return data
}

export const extractErrorMessage = (message) => {
  if (!message) {
    return '系统出错，请联系开发者'
  }

  if (typeof message === 'object') {
    console.log(message)
    console.dir(message)
    return message?.message || JSON.stringify(message)
  }

  if (typeof message === 'string') {
    if (message.indexOf('Failed to launch the browser') !== -1) {
      return '浏览器启动失败，请联系开发者排查'
    }
    if (message.indexOf('Failed to deserialize params.cookies.value') !== -1) {
      return '请检查cookie格式是否正确'
    }
  }
  return message
}
