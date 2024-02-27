import { IpcMainEvent } from 'electron'

export const enum IpcChannel {
  OpenFileDialog = 'OpenFileDialog',

  ValidXhsCookie = 'ValidXhsCookie',

  AddAccount = 'AddAccount',

  UpdateAccount = 'UpdateAccount',

  RemoveAccount = 'RemoveAccount',

  GetAccountList = 'GetAccountList',

  GetNoteList = 'GetNoteList',

  UpdateNote = 'UpdateNote',

  StartNoteMonitor = 'StartNoteMonitor',

  CancelNoteMonitor = 'CancelNoteMonitor',

  GetArticleList = 'GetArticleList',

  GetArticle = 'GetArticle',

  UpdateArticle = 'UpdateArticle',

  ShowOpenDialogSync = 'ShowOpenDialogSync',

  NewNotes = 'NewNotes',

  NewNote = 'NewNote',

  Auth = 'Auth',

  SetAuthCode = 'SetAuthCode',

  RemovePublish = 'RemovePublish',

  SetChromePath = 'SetChromePath',

  OperationNote = 'OperationNote',

  ClearInstance = 'ClearInstance',

  StartAutoPublish = 'StartAutoPublish',

  StopAutoPublish = 'StopAutoPublish',

  CheckIP = 'CheckIP'
}

export type IpcMainEventList = {
  [IpcChannel.OpenFileDialog]: (event: IpcMainEvent, args: number) => void
}

export const AuthList: string[] = [
  IpcChannel.UpdateNote,
  IpcChannel.GetNoteList,
  IpcChannel.GetArticleList,
  IpcChannel.StartNoteMonitor,
  IpcChannel.NewNote,
  IpcChannel.OperationNote,
  IpcChannel.StartAutoPublish
]
