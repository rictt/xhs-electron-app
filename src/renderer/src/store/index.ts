import { reactive } from 'vue'

type GlobalState = {
  currentAccount: XhsAccount | null
  accountList: XhsAccount[]
  activeComponetName: 'Publish' | 'LikeComment' | 'LikeCommentUID' | '' | string
}

export const globalState = reactive<GlobalState>({
  currentAccount: null,
  accountList: [],
  activeComponetName: ''
  // activeComponetName: 'Publish'
  // activeComponetName: 'LikeComment'
})
