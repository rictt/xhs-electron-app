// export let authcode = '465D73BE16E2'
export let authcode = ''
export const authHost = `http://localhost:3000`

export const setCode = (code: string) => {
  authcode = code || ''
}

export async function authCheck() {
  if (!authcode) {
    return false
  }
  try {
    const url = `${authHost}/authcode/valid/${authcode}`
    const response = await fetch(url, { method: 'POST' })
    const result = await response.json()
    console.log(result)
    if (result?.data) {
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
