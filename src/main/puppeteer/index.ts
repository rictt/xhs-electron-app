import { launch } from 'puppeteer'
// import { preloadDetection, getCookies } from '../utils/index'
import { preloadDetection, getCookies } from '../utils'
import * as config from '../config'
import { Xhs } from './xhs'

export async function openChrome() {
  const browser = await launch({
    defaultViewport: null,
    devtools: false
  })
  const page = await browser.newPage()
  const xhs = new Xhs(page)

  await page.setViewport({
    width: 1920,
    height: 1080
  })
  // const cookies = strToCookies(config.cookie, '.xiaohongshu.com')
  // cookies.push(...strToCookies(config.creator_cookie, '.creator.xiaohongshu.com'))
  const cookies = getCookies()

  page.on('response', (response) => {
    xhs.onResponse(response)
  })
  await preloadDetection(page)
  await page.setUserAgent(config.headers.userAgent)
  await page.setCookie(...cookies)
  const list = await xhs.getNoteCommentsByNoteId('657eedd0000000000901b0ad')
  console.log(list.length)
}
