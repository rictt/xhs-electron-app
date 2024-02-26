import { Browser, BrowserContextOptions, LaunchOptions, Page, launch } from 'puppeteer'
import { preloadDetection, getCookies } from '../utils'
import * as config from '../config'
import { Xhs } from './xhs'
import log from 'electron-log'

const isDev = import.meta.env.MODE === 'development'

let __browser: Browser
// const __xhs: Xhs[] = []

// const getDefaultOsPath = () => {
//   if (process.platform === 'win32') {
//     return 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
//   } else {
//     return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
//   }
// }
export const xhsInstances: Xhs[] = []

export const removeXhsInstances = (instance: Xhs) => {
  const index = xhsInstances.findIndex((e) => e === instance)
  if (index !== -1) {
    xhsInstances.splice(index, 1)
    console.log('removeXhsInstances success')
  }
}

type GetInstanceParams = {
  baseCookie: string
  creatorCookie: string
  user_id?: string
  proxyProtocol?: string
  proxyHost?: string
  proxyPort?: string
}

export async function getXhsInstance(params: GetInstanceParams) {
  const { baseCookie, creatorCookie, user_id, proxyProtocol, proxyHost, proxyPort } = params

  const existInstance = xhsInstances.find((e) => e.user_id === user_id)
  if (existInstance) {
    return existInstance
  }

  log.info('getDefaultOsPath(): ', config.getDefaultOsPath())
  if (!__browser) {
    __browser = await launch({
      defaultViewport: null,
      devtools: false,
      headless: !isDev,
      executablePath: config.getDefaultOsPath()
    })
  }
  const browser = __browser
  browser.on('disconnected', () => {
    console.log('[browser disconnected]')
  })

  const browserContextOps: BrowserContextOptions = {}
  if (proxyProtocol && proxyHost && proxyPort) {
    browserContextOps.proxyServer = `${proxyProtocol}://${proxyHost}:${proxyPort}`
  }
  console.log('proxy: ', browserContextOps.proxyServer)
  const context = await browser.createIncognitoBrowserContext(browserContextOps)
  const page = await context.newPage()
  const xhs = new Xhs(page, user_id)
  xhsInstances.push(xhs)
  await page.setViewport({
    width: 1920,
    height: 1080
  })

  const cookies = getCookies(baseCookie, creatorCookie)
  page.on('response', (response) => xhs.onResponse(response))
  page.on('requestfailed', (error: any) => {
    const failedResult: string = error?._failureText || ''
    console.log('requestfailed: ', failedResult)
    if (browserContextOps.proxyServer) {
      if (
        failedResult &&
        (failedResult.indexOf('ERR_TIMED_OUT') !== -1 ||
          failedResult.indexOf('ERR_TUNNEL_CONNECTION_FAILED')! == -1)
      ) {
        // 清除xhs instance，避免重试失败
        removeXhsInstances(xhs)
        context.close()
        console.log('clear success!')
      }
    }
  })

  await preloadDetection(page)
  await page.setUserAgent(config.headers.userAgent)
  await page.setCookie(...cookies)

  return xhs
}
