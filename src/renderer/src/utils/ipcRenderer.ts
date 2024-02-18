import { AuthList, IpcChannel } from '@shared/ipc'
import { getAuthCode } from './index'

export async function Invoke(channel: string, ...args: any[]) {
  if (AuthList.includes(channel)) {
    const flag = await window.electron.ipcRenderer.invoke(IpcChannel.Auth, getAuthCode())
    if (!flag) {
      return window.$message.error('请检查授权码是否正确/有效')
    }
  }
  return window.electron.ipcRenderer.invoke(channel, ...args)
}
