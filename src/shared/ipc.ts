import { IpcMainEvent } from 'electron'

export const enum IpcChannel {
  OpenFileDialog = 'OpenFileDialog',

  ValidXhsCookie = 'ValidXhsCookie',

  AddAccount = 'AddAccount',

  UpdateAccount = 'UpdateAccount',

  GetAccountList = 'GetAccountList',

  GetNoteList = 'GetNoteList',

  UpdateNote = 'UpdateNote',

  StartNoteMonitor = 'StartNoteMonitor',

  CancelNoteMonitor = 'CancelNoteMonitor',

  GetArticleList = 'GetArticleList',

  GetArticle = 'GetArticle',

  ShowOpenDialogSync = 'ShowOpenDialogSync',

  NewNotes = 'NewNotes',

  NewNote = 'NewNote',

  Auth = 'Auth',

  SetAuthCode = 'SetAuthCode',

  RemovePublish = 'RemovePublish'
}

export type IpcMainEventList = {
  [IpcChannel.OpenFileDialog]: (event: IpcMainEvent, args: number) => void
}

export const AuthList: string[] = [
  IpcChannel.GetNoteList,
  IpcChannel.StartNoteMonitor,
  IpcChannel.NewNote
]
