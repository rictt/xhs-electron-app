export const requireNativeImage = (localPath: string) => {
  return 'xhsimage:///' + localPath
}

export const replaceNativeImageScheme = (url: string) => {
  return url.replace('xhsimage:///', '')
}
