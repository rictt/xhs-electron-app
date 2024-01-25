import { Browser, Page, launch } from 'puppeteer'
import { preloadDetection, getCookies } from '../utils'
import * as config from '../config'
import { Xhs } from './xhs'

let __browser: Browser
const __xhs: Xhs[] = []

type GetInstanceParams = {
  baseCookie: string
  creatorCookie: string
  user_id?: string
}
export async function getXhsInstance(params: GetInstanceParams) {
  const { baseCookie, creatorCookie, user_id } = params
  if (user_id) {
    const instance = __xhs.find((e) => e.user_id === user_id)
    if (instance) {
      return instance
    }
  }

  if (!__browser) {
    __browser = await launch({
      defaultViewport: null,
      devtools: false
    })
  }
  const browser = __browser
  browser.on('disconnected', () => {
    console.log('[browser disconnected]')
  })

  const context = await browser.createIncognitoBrowserContext()
  // const page = await browser.newPage()
  const page = await context.newPage()
  const xhs = new Xhs(page, user_id)
  await page.setViewport({
    width: 1920,
    height: 1080
  })

  const cookies = getCookies(baseCookie, creatorCookie)
  page.on('response', (response) => xhs.onResponse(response))
  await preloadDetection(page)
  await page.setUserAgent(config.headers.userAgent)
  await page.setCookie(...cookies)

  return xhs
}
