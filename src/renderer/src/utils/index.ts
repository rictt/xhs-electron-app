export const requireNativeImage = (localPath: string) => {
  return 'xhsimage:///' + localPath
}

export const replaceNativeImageScheme = (url: string) => {
  return url.replace('xhsimage:///', '')
}

const AuthCodeStorageKey = 'AAAA_CODE'
export const getAuthCode = () => {
  return localStorage.getItem(AuthCodeStorageKey) || ''
}

export const setAuthCode = (value: string) => {
  return localStorage.setItem(AuthCodeStorageKey, value)
}
