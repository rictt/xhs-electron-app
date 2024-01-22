import { IpcMainEvent, ipcMain } from 'electron'
import { IpcChannel } from '../../ipc'

export const listeners = {
  [IpcChannel.OpenFileDialog]: (event: IpcMainEvent) => {
    console.log(event)
  }
}

export const registerIpcMainEvent = () => {
  Object.entries(listeners).forEach((item) => {
    const [name, handler] = item
    ipcMain.handle(name, handler)
  })
}
