import { reactive } from 'vue'

type GlobalState = {
  currentAccount: XhsAccount | null
  accountList: XhsAccount[]
  activeComponetName: 'Publish' | ''
}

export const globalState = reactive<GlobalState>({
  currentAccount: null,
  accountList: [],
  // activeComponetName: 'Publish'
  activeComponetName: ''
})
