import { IpcChannel } from 'src/ipc'
import { electronAPI } from '@electron-toolkit/preload'

export function invoke(channel: IpcChannel, ...args: any[]) {
  return electronAPI.ipcRenderer.invoke(channel, ...args)
}

invoke(IpcChannel.OpenFileDialog)
