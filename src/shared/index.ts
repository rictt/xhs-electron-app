export const version = '1.2.3'

import type { IpcMainInvokeEvent } from 'electron'

function onMainHandler(_event: IpcMainInvokeEvent, ..._args: any[]) {
  console.log('do something')
}

export const enum IpcChannel {
  MethodOne = 'MethodOne',
  MethodTwo = 'MethodTwo'
}
interface InvokeParams {
  [IpcChannel.MethodOne]: <T = never>(num: number, num2: number) => Promise<T>
  [IpcChannel.MethodTwo]: (str: string, str2: string) => void
}

/**
 * 期待进行调用某个方法的时候，能够对应提示该方法需要的参数
 * 比如MethoneOne需要两个number类型参数
 */
function Invoke<T extends IpcChannel, ResponseT = never>(
  channel: T,
  ...args: Parameters<InvokeParams[T]>
): ResponseT {
  return '' as ResponseT
}

const value = Invoke<IpcChannel.MethodOne, string>(IpcChannel.MethodOne, 1, 2)
Invoke(IpcChannel.MethodTwo, '1', '2')
