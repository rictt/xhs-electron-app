import { IpcMainEvent, ipcMain } from 'electron'
import { IpcChannel } from '@shared/ipc'
import { getXhsInstance } from '../puppeteer'
import { systemDb } from '../lowdb'

export const listeners = {
  [IpcChannel.OpenFileDialog]: (event: IpcMainEvent) => {
    console.log(event)
  },

  [IpcChannel.ValidXhsCookie]: async (_event: IpcMainEvent, args: any) => {
    console.log(args)
    const { baseCookie, creatorCookie } = args
    const xhs = await getXhsInstance({ baseCookie, creatorCookie })
    try {
      const data = await xhs.validCookie()
      console.log('xhs: ', data)
      return data
    } catch (error) {
      console.log('xhs failed: ', error)
      return Promise.reject(error)
    } finally {
      xhs.page.close()
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
  },

  [IpcChannel.GetNoteList]: async (_event: IpcMainEvent, account: XhsAccount, sync?: boolean) => {
    if (sync) {
      try {
        console.log('account: ', account)
        const xhs = await getXhsInstance({
          baseCookie: account.baseCookie,
          creatorCookie: account.creatorCookie,
          user_id: account.user_id
        })
        // return await xhs.getNoteCommentsByNoteId(account.user_id)
        const newNotes = await xhs.getOwnNotes()
        console.log('new notes: ', newNotes.length)
        await systemDb.db.read()
        const newNoteIds = newNotes.map((e) => e.note_id)
        const oldNotes = systemDb.data.notes.filter((e) => !newNoteIds.includes(e.note_id))
        const result = [...oldNotes, ...newNotes]
        systemDb.data.notes = result
        const userOwn = result.filter((e) => e.user_id === account.user_id)
        console.log('write notes: ', systemDb.data.notes.length)
        await systemDb.db.write()
        return userOwn
      } catch (error) {
        console.log('GetNoteList error: ', error)
        return []
      }
    } else {
      await systemDb.db.read()
      return systemDb.data.notes.filter((e) => e.user_id && e.user_id === account.user_id)
    }
  },

  [IpcChannel.UpdateNote]: async (
    _event: IpcMainEvent,
    note_id: string,
    key: string,
    value: any
  ) => {
    await systemDb.updateNote(note_id, key, value)
    return true
  },

  [IpcChannel.StartNoteMonitor]: async (
    _event: IpcMainEvent,
    account: XhsAccount,
    note_id: string,
    reply_text: string
  ) => {
    const xhs = await getXhsInstance({
      baseCookie: account.baseCookie,
      creatorCookie: account.creatorCookie
    })
    xhs.monitorAutoReplyComment(note_id, reply_text)
    await systemDb.db.read()
    systemDb.data.notes.forEach((note) => {
      if (note.note_id === note_id) {
        note.status = 'monitor'
      }
    })
    await systemDb.db.write()
    console.log('开启监听')
    return true
  },

  [IpcChannel.CancelNoteMonitor]: async (_event: IpcMainEvent, note_id: string) => {}
}

export const registerIpcMainEvent = () => {
  Object.entries(listeners).forEach((item) => {
    const [name, handler] = item
    ipcMain.handle(name, handler)
  })
}
