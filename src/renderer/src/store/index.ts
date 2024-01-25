import { reactive } from 'vue'

type GlobalState = {
  currentAccount: XhsAccount | null
  accountList: XhsAccount[]
}

export const globalState = reactive<GlobalState>({
  currentAccount: null,
  accountList: []
})
