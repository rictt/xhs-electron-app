import { reactive } from 'vue'

type GlobalState = {
  currentAccount: XhsAccount | null
}

export const globalState = reactive<GlobalState>({
  currentAccount: null
})
