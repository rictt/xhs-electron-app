import { systemDb } from '@main/lowdb'

// export let authcode = '465D73BE16E2'
export let authcode = ''
// export const authHost = `http://localhost:3000`
export const authHost = `https://zikao365.online/api`

export const setCode = (code: string) => {
  authcode = code || ''
}

export async function authCheck() {
  if (!authcode) {
    console.log('auth code empty')
    return false
  }
  try {
    const url = `${authHost}/authcode/valid/${authcode}`
    const useId = systemDb.data.use_id || ''
    const body = JSON.stringify(useId ? { use_id: useId } : {})
    const response = await fetch(url, {
      method: 'POST',
      body,
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    })
    const result = await response.json()
    console.log('auth result: ', result, !!result.data)
    if (result && result?.data) {
      return true
    }
    return false
  } catch (error) {
    console.log(error)
    return false
  }
}

export async function Auth() {
  const isAuth = await authCheck()
  return !!isAuth
}

export async function pushServerLog(data: string) {
  try {
    const url = `${authHost}/authcode/log`
    await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        code: authcode,
        create_time: Date.now(),
        message: data
      }),
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    })
    console.log('推送日志成功')
  } catch (error) {
    console.log(error)
  }
}

let timer = null
function autoLog() {
  timer = setTimeout(() => {
    pushServerLog('Auto')
    autoLog()
  }, 120 * 1000)
}

pushServerLog('启动APP')
autoLog()
