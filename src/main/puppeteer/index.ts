import { Browser, launch } from 'puppeteer'
import { preloadDetection, getCookies } from '../utils'
import * as config from '../config'
import { Xhs } from './xhs'

let __browser: Browser

export async function createXhsInstance(baseCookie: string, creator_cookie: string) {
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

  const page = await browser.newPage()
  const xhs = new Xhs(page)
  await page.setViewport({
    width: 1920,
    height: 1080
  })

  const cookies = getCookies(baseCookie, creator_cookie)
  page.on('response', (response) => xhs.onResponse(response))
  await preloadDetection(page)
  await page.setUserAgent(config.headers.userAgent)
  await page.setCookie(...cookies)

  return xhs
}
