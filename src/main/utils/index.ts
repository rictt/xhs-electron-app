import { cookie, creator_cookie, creator_cookie_names } from '../config'

export function getCookies() {
  const list1 = strToCookies(cookie, '.xiaohongshu.com')

  if (creator_cookie) {
    const list2 = strToCookies(creator_cookie, '.xiaohongshu.com')

    // creator的cookie包含主站的，所以首先默认写成主战的，再根据名单，写对应creator的cookie
    list1.forEach((cookie) => {
      if (creator_cookie_names.includes(cookie.name)) {
        cookie.domain = '.creator.xiaohongshu.com'
      }
    })
    const result = []
    list1.forEach((cookie) => {
      if (list2.find((e) => e.name !== cookie.name)) {
        result.push(cookie)
      }
    })
    result.push(...list2)
    return result
  }

  return [...list1]
}

export function strToCookies(str, domain) {
  const parts = str.split(';')
  const result = []
  parts.forEach((part) => {
    const [name, value] = part.split('=')
    result.push({
      name: name.replace(/\s+/, ''),
      value,
      domain,
      path: '/',
      expires: Date.now() + 3600 * 1000
    })
  })

  return result
}

export async function preloadDetection(page) {
  await page.evaluateOnNewDocument(() => {
    const newProto = (navigator as any).__proto__
    delete newProto.webdriver
    ;(navigator as any).__proto__ = newProto
  })

  await page.evaluateOnNewDocument(() => {
    ;(window.navigator as any).chrome = {
      runtime: {}
    }
  })
}

export function extractQueryByUrl(url: string) {
  const params = {}
  if (url.indexOf('?') !== -1) {
    const paramArr = url.slice(url.indexOf('?') + 1).split('&')
    paramArr.map((param) => {
      const [key, val] = param.split('=')
      params[key] = decodeURIComponent(val)
    })
  }
  return params
}

export function extractBodyByPostData(data: string) {
  let result = {}
  if (!data) {
    return result
  }
  if (data.indexOf('{') !== -1 || data.indexOf('[') !== -1) {
    try {
      result = JSON.parse(data)
    } catch (error) {
      return result
    }
  }
  return result
}
