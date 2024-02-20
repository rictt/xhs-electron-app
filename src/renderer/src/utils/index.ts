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

const ChromePathKey = 'Chrome_PATH'
export const setChromePath = (value: string) => {
  return localStorage.setItem(ChromePathKey, value)
}
export const getChromePath = () => {
  return localStorage.getItem(ChromePathKey) || ''
}
