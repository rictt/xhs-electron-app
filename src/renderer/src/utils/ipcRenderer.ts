import { AuthList, IpcChannel } from '@shared/ipc'
import { getAuthCode } from './index'

export async function Invoke(channel: IpcChannel, ...args: any[]) {
  if (AuthList.includes(channel)) {
    const response = await window.electron.ipcRenderer.invoke(IpcChannel.Auth, getAuthCode())
    console.log(response)
    if (!response || !response.data) {
      window.$message.error('请检查授权码是否正确/有效')
      return null
    }
  }
  console.log('args: ', args)
  const { data, success, message } = await window.electron.ipcRenderer.invoke(channel, ...args)
  console.log(data, success, message)
  if (!success) {
    const msg = extractErrorMessage(message)
    msg && window.$message.error(msg)
    throw new Error(msg)
  }

  return data
}

export const extractErrorMessage = (message) => {
  if (!message) {
    return '系统出错，请联系开发者'
  }
  message = typeof message === 'object' && message?.message ? message?.message : message

  if (message && typeof message === 'string') {
    if (message.indexOf('Failed to launch the browser') !== -1) {
      return '浏览器启动失败，请联系开发者排查'
    }
    if (message.indexOf('Failed to deserialize params.cookies.value') !== -1) {
      return '请检查cookie格式是否正确'
    }
    if (
      message.indexOf('ERR_TUNNEL_CONNECTION_FAILED') !== -1 ||
      message.indexOf('ERR_TIMED_OUT') !== -1
    ) {
      return '请检查代理或网络是否设置正确'
    }
  }
  return message
}
