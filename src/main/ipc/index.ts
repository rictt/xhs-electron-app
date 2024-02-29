import { IpcMainEvent, OpenDialogOptions, dialog, ipcMain } from 'electron'
import { AuthList, IpcChannel } from '@shared/ipc'
import {
  getUserNotes,
  getXhsInstance,
  newPage,
  removeXhsInstances,
  xhsInstances
} from '../puppeteer'
import { systemDb } from '../lowdb'
import log from 'electron-log/main'
import { Auth, setCode, pushServerLog } from '@main/utils/auth'
import { setUserCustomChromePath } from '@main/config'
import { createTaskScheduleInst, removeTaskInstance } from '@main/puppeteer/task'
import { IpcMainInvokeEvent } from 'electron/main'

export const listeners = {
  [IpcChannel.SetChromePath]: async (_event, chromePath: string) => {
    return setUserCustomChromePath(chromePath)
  },

  [IpcChannel.SetAuthCode]: (_event, code: string) => {
    return setCode(code)
  },

  [IpcChannel.Auth]: async (_event, code = '') => {
    setCode(code)
    return await Auth()
  },

  [IpcChannel.OpenFileDialog]: (event: IpcMainEvent) => {
    console.log(event)
  },

  [IpcChannel.ValidXhsCookie]: async (_event: IpcMainEvent, args: any) => {
    const { baseCookie, creatorCookie, proxyProtocol, proxyHost, proxyPort } = args
    const xhs = await getXhsInstance({
      baseCookie,
      creatorCookie,
      proxyProtocol,
      proxyHost,
      proxyPort
    })
    try {
      const data = await xhs.validCookie()
      console.log('xhs: ', data)
      return data
    } catch (error) {
      log.error('ValidXhsCookie error: ', error)
      console.log('xhs failed: ', error)
      return Promise.reject(error)
    } finally {
      await xhs.page.close()
      removeXhsInstances(xhs)
    }
  },

  [IpcChannel.AddAccount]: async (_event: IpcMainEvent, user: any) => {
    try {
      console.log('add user: ', user)
      await systemDb.addAccount(user)
    } catch (error) {
      return false
    }
    return true
  },

  [IpcChannel.RemoveAccount]: async (_event: IpcMainEvent, user_id: string) => {
    try {
      systemDb.data.accounts = systemDb.data.accounts.filter((e) => e.user_id !== user_id)
      await systemDb.db.write()
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
    log.info('account: ', sync, !!account)
    if (sync) {
      try {
        console.log('account: ', account)
        const xhs = await getXhsInstance({
          baseCookie: account.baseCookie,
          creatorCookie: account.creatorCookie,
          user_id: account.user_id
        })
        await xhs.validCookie()
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
        await xhs.page.close()
        removeXhsInstances(xhs)
        return userOwn
      } catch (error) {
        log.error('get Note list error: ', error)
        console.log('GetNoteList error: ', error)
        // return []
        throw error
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
    await xhs.validCookie()
    const monitorId = await xhs.createMonitorId(note_id)
    xhs.monitorAutoReplyComment(note_id, reply_text)
    await systemDb.db.read()
    await systemDb.updateNote(note_id, 'monitor_id', monitorId)
    await systemDb.updateNote(note_id, 'status', 'monitor')
    return monitorId
  },

  [IpcChannel.CancelNoteMonitor]: async (
    _event: IpcMainEvent,
    monitor_id: string,
    note_id: string
  ) => {
    const instance = xhsInstances.find((e) => e.monitor_id === monitor_id)
    if (instance) {
      instance.stopMonitor()
    }
    await systemDb.updateNote(note_id, 'monitor_id', '')
    await systemDb.updateNote(note_id, 'status', 'idle')
    return true
  },

  [IpcChannel.GetArticleList]: async (_event) => {
    const list = systemDb.data.articles.map((e) => {
      const item = {
        ...e
      }
      if (item.taskOps) {
        delete item.taskOps.task
      }
      return item
    })
    return list
  },

  [IpcChannel.UpdateArticle]: async (_event, id: string, key: string, value: any) => {
    await systemDb.updateArticle(id, key, value)
    return true
  },

  [IpcChannel.ShowOpenDialogSync]: async (_event: IpcMainEvent, options: OpenDialogOptions) => {
    try {
      return (await dialog.showOpenDialogSync(options)) || []
    } catch (error) {
      console.log('show open error: ', error)
    }
    return []
  },

  // 创建新的笔记
  // 根据传进来的参数，挨个打开账号，输入文本，标题，图片，然后发送
  [IpcChannel.NewNote]: async (_event, params: CreateNoteForm) => {
    console.log('params: ', params)
    const { account, title, desc, pictures, topics, isPublic, isAuto } = params
    pushServerLog('NewNote')
    const xhsInstance = await getXhsInstance({
      ...account
    })
    const result: PublishResult = {
      account,
      message: '',
      success: false
    }
    try {
      await xhsInstance.publicPicText({
        title,
        desc,
        pictures,
        topics,
        isPublic
      })
      result.success = true
      await systemDb.db.read()
      const articles = systemDb.data.articles || []
      articles.push({
        id: Date.now() + '',
        title,
        desc,
        pictures,
        user_id: account.user_id,
        account: account,
        create_time: Date.now(),
        isPublic,
        isAuto,
        topics
      })
      systemDb.data.articles = articles
      await systemDb.db.write()
    } catch (error) {
      result.success = false
      result.message = error || '发布失败'
    }
    await xhsInstance.page.close()
    await removeXhsInstances(xhsInstance)
    return result
  },

  [IpcChannel.RemovePublish]: async (_event, row: ArticleDataItem) => {
    const { id, user_id, title } = row
    if (id) {
      systemDb.data.articles = systemDb.data.articles.filter((e) => e.id !== id)
    } else {
      systemDb.data.articles = systemDb.data.articles.filter(
        (e) => e.user_id !== user_id && e.title !== title
      )
    }
    await systemDb.db.write()
  },

  [IpcChannel.OperationNote]: async (_event, params: NoteOperationOps) => {
    const { account } = params
    const xhs = await getXhsInstance({
      ...account
    })
    await xhs.validCookie()
    const response = await xhs.likeCollectComment(params)

    xhs.status = 'idle'
    return response
  },

  [IpcChannel.ClearInstance]: async (_event, user_id: string) => {
    if (!user_id) return ''
    let instance = xhsInstances.find((e) => e.user_id == user_id && e.status === 'idle')
    console.log('xhsInstances length: ', xhsInstances)
    while (instance) {
      await instance.page.close()
      removeXhsInstances(instance)
      instance = xhsInstances.find((e) => e.user_id == user_id && e.status === 'idle')
    }
    return true
  },

  [IpcChannel.StartAutoPublish]: async (
    _event: IpcMainInvokeEvent,
    articleItem: ArticleDataItem,
    ops: TaskSchedulingOps
  ) => {
    if (!articleItem || !articleItem.id) {
      return console.log('article empty')
    }
    ops.task = () => {
      console.log('执行了一次')
      listeners[IpcChannel.NewNote](_event, {
        account: articleItem.account,
        title: articleItem.title,
        desc: articleItem.desc,
        pictures: articleItem.pictures,
        isPublic: articleItem.isPublic,
        topics: articleItem.topics,
        isAuto: true
      })
    }
    const ins = await createTaskScheduleInst(articleItem.id, ops)
    ins.on('end', () => {
      console.log('StartAutoPublish end 结束')
      console.log('通知前台进行刷新页面')
      _event.sender.send('AutoPublishProgress')
    })
    return true
  },

  [IpcChannel.StopAutoPublish]: async (_event, articleId: string) => {
    if (!articleId) {
      return console.log('articleId empty')
    }
    await removeTaskInstance(articleId)
    await systemDb.updateArticle(articleId, 'taskOps', null)
  },

  [IpcChannel.GetUserPublishList]: async (_event, uids: string[]) => {
    const notes = []
    for (let i = 0; i < uids.length; i++) {
      const uid = uids[i]
      const list = await getUserNotes(uid)
      console.log('list: ', list)
      notes.push(...list)
    }
    return notes
  }
}

export const registerIpcMainEvent = () => {
  Object.entries(listeners).forEach((item) => {
    const [name, handler] = item
    ipcMain.handle(name, async (event: IpcMainEvent, ...rest) => {
      let isAuth = true
      console.log('call name: ', name)
      if (AuthList.includes(name)) {
        try {
          isAuth = await Auth()
        } catch (error) {
          isAuth = false
          console.log('鉴权失败: ', name, error)
        }
      }
      const response = {
        data: null,
        message: '',
        success: isAuth
      }
      if (AuthList.includes(name)) {
        console.log('鉴权结果：', isAuth)
        console.log('鉴权响应：', response)
      }
      if (isAuth) {
        try {
          // @ts-ignore: 11
          response.data = await handler(event, ...rest)
        } catch (error) {
          log.error(`handler ${name} error: `, error)
          response.success = false
          response.message = error
        }
      } else {
        console.log('鉴权失败: ', name)
      }
      return response
    })
  })
}
