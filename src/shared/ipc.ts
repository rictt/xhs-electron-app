import { IpcMainEvent } from 'electron'

export const enum IpcChannel {
  OpenFileDialog = 'OpenFileDialog',

  ValidXhsCookie = 'ValidXhsCookie',

  AddAccount = 'AddAccount',

  UpdateAccount = 'UpdateAccount',

  GetAccountList = 'GetAccountList',

  GetNoteList = 'GetNoteList'
}

export type IpcMainEventList = {
  [IpcChannel.OpenFileDialog]: (event: IpcMainEvent, args: number) => void
}
