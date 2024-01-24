import { IpcMainEvent, ipcMain } from 'electron'
import { IpcChannel } from '@shared/ipc'
import { createXhsInstance } from '../puppeteer'
import { systemDb } from '../lowdb'

export const listeners = {
  [IpcChannel.OpenFileDialog]: (event: IpcMainEvent) => {
    console.log(event)
  },

  [IpcChannel.ValidXhsCookie]: async (_event: IpcMainEvent, args: any) => {
    console.log(args)
    const { baseCookie, creatorCookie } = args
    const xhs = await createXhsInstance(baseCookie, creatorCookie)
    try {
      const data = await xhs.validCookie()
      console.log('xhs: ', data)
      return data
    } catch (error) {
      console.log('xhs failed: ', error)
      return Promise.reject(error)
    } finally {
      await xhs.page.close()
    }
  },

  [IpcChannel.AddAccount]: async (_event: IpcMainEvent, user: any) => {
    try {
      await systemDb.addAccount(user)
    } catch (error) {
      return false
    }
    return true
  },

  [IpcChannel.GetAccountList]: async (_event: IpcMainEvent) => {
    await systemDb.db.read()
    return systemDb.data.accounts
  },

  [IpcChannel.UpdateAccount]: async (_event: IpcMainEvent, account: XhsAccount) => {
    try {
      await systemDb.db.read()
      const list = systemDb.data.accounts
      const target = list.find((e) => e.user_id === account.user_id)
      if (target) {
        Object.keys(account).forEach((key) => {
          target[key] = account[key]
        })
      }

      systemDb.data.accounts = list
      await systemDb.db.write()
      return true
    } catch (error) {
      return false
    }
  }
}

export const registerIpcMainEvent = () => {
  Object.entries(listeners).forEach((item) => {
    const [name, handler] = item
    ipcMain.handle(name, handler)
  })
}
