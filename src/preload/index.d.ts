import { ElectronAPI } from '@electron-toolkit/preload'
import { MessageApi } from 'naive-ui'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    $message: MessageApi
  }
}
