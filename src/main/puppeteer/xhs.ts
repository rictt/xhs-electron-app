import type { Page, HTTPResponse } from 'puppeteer'
import { EventEmitter } from 'events'
import fs from 'fs'
import path from 'path'
import { extractQueryByUrl, extractBodyByPostData } from '../utils'
import { systemDb } from '@main/lowdb'
import log from 'electron-log/main'

const __dirname = path.resolve()

type RuleHandler = (data: any, query: any, payload: any) => void
type Method = 'GET' | 'POST'
type Rule = {
  method: Method
  path: string
  // handler: (data: any, query: Object, payload: Object) => void
  handler: RuleHandler
}

type Status = 'idle' | 'monitor' | 'fetch_comments'

type UserInfo = {
  desc: string
  red_id: string
  user_id: string
  nickname: string
}

type Comment = {
  id: string
  content: string
  like_count: string
  note_id: string
  sub_comment_count: string
  create_time: number
}

export class Xhs extends EventEmitter {
  page: Page
  rules: Rule[] = []
  userInfo: UserInfo
  user_id: string = ''
  max_comments_count: number = 100
  loading: boolean = false
  commentMap: Map<string, Comment[]> = new Map()
  has_more_comments: boolean = true
  status: Status = 'idle'
  timer: string | number | NodeJS.Timeout
  monitor_id?: string

  proxy_protocol?: string
  proxy_host?: string
  proxy_port?: string
  proxy_auth_username?: string
  proxy_auth_password?: string
  proxy_get_url?: string

  constructor(page: Page, user_id?: string) {
    super()
    this.status = 'idle'
    this.user_id = user_id
    this.page = page
    this.addRule('v1/you/mentions', this.onMentionsResponse.bind(this))
    // this.addRule('sns/web/unread_count', this.onUnReadCountResponse.bind(this))
    this.addRule('sns/web/v2/user/me', this.onMeResponse.bind(this))
    this.addRule('sns/web/v2/comment/page?note_id', this.onNoteCommentsResponse.bind(this))
    this.addRule('sns/web/v1/comment/post', this.onCommentPostResponse.bind(this), 'POST')
    this.addRule('sns/v2/note', this.onPublishNoteResponse.bind(this), 'POST')
    this.addRule('sns/v1/search/topic', this.onTopicResponse.bind(this), 'POST')
  }

  addRule(path, handler, method: Method = 'GET') {
    this.rules.push({
      path,
      handler,
      method
    })
  }

  async onResponse(response: HTTPResponse) {
    const url = response.url()
    const method = response.request().method()
    let json = {} as any
    for (const rule of this.rules) {
      if (rule.method === method) {
        if (url.indexOf(rule.path) !== -1) {
          try {
            json = await response.json()
          } catch (error) {
            console.log(error)
          }
          if (json && json.success) {
            const request = response.request()
            const query = extractQueryByUrl(request.url())
            const payload = extractBodyByPostData(request.postData())
            rule.handler(json.data, query, payload)
          } else {
            const msg = (json?.msg ?? '') as string
            const isExpired = msg.indexOf('过期') !== -1 || msg.indexOf('无登录') !== -1
            if (isExpired) {
              console.log('登录信息已过期', msg)
              this.emit('meResponse', { guest: true })
            } else {
              console.log('request failed, url is: ', url + ' response was: ', json)
            }
          }
        }
      }
    }
  }

  async onTopicResponse(data, query, payload) {
    console.log('topic data: ', data)
    const { topic_info_dtos } = data
    const { keyword } = payload || {}
    if (keyword) {
      this.emit(`topic:${keyword}`, topic_info_dtos || [])
    }
  }

  async onMentionsResponse(data) {
    const p = path.join(__dirname, './onMentionsResponse.json')
    fs.writeFileSync(p, JSON.stringify(data, null, 2))
  }

  async onUnReadCountResponse(data) {
    const p = path.join(__dirname, './onUnReadCountResponse.json')
    fs.writeFileSync(p, JSON.stringify({ ...data, time: Date.now() }, null, 2))
  }

  async validCookie() {
    return new Promise(async (resolve, reject) => {
      let timer = setTimeout(() => {
        reject('timeout')
      }, 1000 * 60)
      this.on('meResponse', (data) => {
        clearTimeout(timer)
        timer = null
        // console.log('me response: ', data)
        if (!data || data.guest) {
          reject('登录信息已过期')
        } else {
          resolve(data)
        }
      })
      await this.page.goto('https://www.xiaohongshu.com/explore')
    })
  }

  async onMeResponse(data) {
    // console.log('me data: ', data)
    if (!data.guest) {
      this.userInfo = data
      this.user_id = data.user_id
    }
    this.emit('meResponse', data)
    await this.timeout()
  }

  async onNoteCommentsResponse(data, query) {
    const { comments, has_more } = data
    const { note_id } = query
    if (!note_id) {
      return console.log('query note_id not found!')
    }

    const list = this.commentMap.get(note_id) || []
    const ids = list.map((e) => e.id)
    const newList = [...list]
    ;(comments as Comment[]).forEach((com) => {
      if (!ids.includes(com.id)) {
        ids.push(com.id)
        newList.push(com)
      }
    })
    this.commentMap.set(note_id, newList)
    this.has_more_comments = has_more

    console.log('on onNoteCommentsResponse, has more: ', has_more, ' list len: ', list.length)

    if (this.status === 'fetch_comments') {
      if (!has_more || list.length > this.max_comments_count) {
        this.status = 'idle'
        this.emit(note_id + ':' + 'done', list.slice(0, 100))
        return
      }

      if (has_more) {
        console.log('has more call')
        // await this.page.screenshot({ path: 'note1.png' })
        // 尺寸不同的滚动容器不一样，这里要考虑下兼容
        // 如果设备固定是1920 * 1080，就无所谓了
        await this.page.waitForSelector('.note-scroller')
        await this.page.$eval('.note-scroller', (el) => {
          if (el) {
            el.scrollTo(0, 1000000)
          } else {
            console.log('#note container not found')
          }
        })
        await this.timeout(500)
      }
    }
  }

  async timeout(timeout: number = 300) {
    return new Promise((resolve) => {
      setTimeout(resolve, timeout)
    })
  }

  async getOwnNotes(): Promise<NoteDataItem[]> {
    if (!this.user_id) {
      console.log('user login failed')
      return []
    }
    if (this.loading) {
      console.log('loading...')
      return []
    }
    this.loading = true
    await this.page.goto(`https://www.xiaohongshu.com/user/profile/${this.user_id}`)
    // await this.page.screenshot({ path: 'me.png' })
    await Promise.all([
      this.page.waitForSelector('.note-item'),
      this.page.waitForSelector('.cover')
    ])
    await this.timeout()
    const list = await this.page.$$eval(
      '.note-item',
      function (eles, user_id) {
        return eles.map(function (e) {
          const noteHref = e.querySelector('a')?.href
          const title = (e.querySelector('.footer span') as HTMLElement)?.innerText
          const count = (e.querySelector('.count') as HTMLElement)?.innerText
          const cover =
            (e.querySelector('.cover') as HTMLElement)?.style?.backgroundImage?.slice(5, -2) ?? ''
          const parts = noteHref?.split?.('/') || []
          const noteId = parts[parts.length - 1]

          return {
            note_href: noteHref,
            title,
            count,
            cover,
            user_id: user_id,
            note_id: noteId,
            status: 'idle'
          }
        })
      },
      this.user_id
    )

    return list as NoteDataItem[]
  }

  async getNoteCommentsByNoteId(id: string): Promise<Comment[]> {
    if (!id) {
      console.log('note id not exist: ', id)
      return []
    }
    this.status = 'fetch_comments'
    await this.page.goto(`https://www.xiaohongshu.com/explore/${id}`)
    // await this.page.screenshot({ path: 'note.png' })
    await this.page.waitForSelector('.content', {
      timeout: 1000 * 60
    })

    return new Promise((resolve) => {
      const name = id + ':' + 'done'

      let timer = setTimeout(() => {
        handler(this.commentMap.get(id).slice(0, this.max_comments_count))
      }, 1000 * 60)

      const handler = (list) => {
        clearTimeout(timer)
        timer = null
        list = list.slice(0, this.max_comments_count)
        fs.writeFileSync('./noteComments.json', JSON.stringify(list, null, 2))
        resolve(list)
        this.off(name, handler)
      }

      this.on(name, handler)
    })
  }

  async onCommentPostResponse(data, query, payload) {
    const { note_id, target_comment_id, content } = payload || {}
    // if (!note_id || !target_comment_id || !content) {
    if (!note_id || !content) {
      console.log('onCommentPostResponse error: ', data, query, payload)
      return
    }

    if (target_comment_id) {
      await systemDb.db.read()
      const list = systemDb.data.comments || []
      list.push({
        note_id,
        target_comment_id,
        content
      })
      systemDb.data.comments = [...list]
      await systemDb.db.write()
      const name = 'reply:' + target_comment_id
      console.log('onCommentPostResponse: ', name)
      this.emit(name, data)
    }

    this.emit('replyReponse', payload, data)
  }

  async scrollToBottom() {
    await this.page.waitForSelector('.note-scroller')
    await this.page.$eval('.note-scroller', (el) => {
      if (el) {
        el.scrollTo(0, 1000000)
      } else {
        console.log('#note container not found')
      }
    })
    await this.timeout()
  }

  async createMonitorId(note_id: string) {
    if (!this.monitor_id) {
      console.log('call before create monitor id')
      this.monitor_id = `${note_id}_${Date.now()}`
    }
    return this.monitor_id
  }

  // 监听笔记下的评论
  async monitorAutoReplyComment(note_id: string, reply_text: string) {
    const text = reply_text
    if (!note_id) {
      console.log('note_id not found is required!!')
      return
    }
    await this.page.goto(`https://www.xiaohongshu.com/explore/${note_id}`)
    await this.timeout()

    let start_index = 1
    const has_more = this.has_more_comments

    const handler = async () => {
      const selector = `.parent-comment:nth-child(${start_index})`
      const target = !!(await this.page.$(selector))
      if (!target) {
        if (has_more) {
          await this.scrollToBottom()
          await handler()
        } else {
          // 刷新页面，实现
          this.timer = setTimeout(async () => {
            console.log('刷新页面开启')
            // 由于是刷新页面，需要重置index，否则一直会找不到新的评论
            start_index = 1
            await this.page.goto(`https://www.xiaohongshu.com/explore/${note_id}`)
            await handler()
            console.log('刷新页面成功')
            // }, 1000 * 120)
          }, 1000 * 30)
          console.log('等待重新刷新页面')
        }
      } else {
        await systemDb.db.read()
        const exist_list = systemDb.data.comments || []
        const comment_id = await this.page.$eval(selector, (el: HTMLElement) => {
          return el.children[0].getAttribute('id').split('-')[1]
        })
        if (exist_list.find((e) => e.target_comment_id === comment_id)) {
          console.log('已经存在，跳过')
          start_index++
          await handler()
          return
        }

        await this.replyTo(start_index, text)
        await this.timeout(1000)
        start_index++
        await handler()
      }
    }

    this.status = 'monitor'
    await handler()
  }

  async stopMonitor() {
    console.log('结束自动化')
    clearTimeout(this.timer)
    this.timer = null
    await this.page.goto('https://www.xiaohongshu.com/explore')
    this.status = 'idle'
  }

  async replyTo(index: number, reply_text: string) {
    return new Promise(async (resolve) => {
      const box_selector = `.parent-comment:nth-child(${index})`
      const selector = `${box_selector} .reply`
      const comment_id = await this.page.$eval(box_selector, (el: HTMLElement) => {
        return el.children[0].getAttribute('id').split('-')[1]
      })

      if (!comment_id) {
        console.log('comment_id not found')
        resolve('')
        return
      }

      const name = 'reply:' + comment_id
      const handler = (data) => {
        console.log(`回复 ${comment_id} 成功, `, ' 回复文本为：' + reply_text)
        this.off(name, handler)
        resolve(data)
      }
      this.on(name, handler)

      await this.page.$eval(selector, (el: HTMLElement) => {
        el.click()
      })
      await this.page.waitForSelector('#content-textarea')

      await this.page.type('#content-textarea', reply_text, {
        delay: 100
      })
      // await this.page.screenshot({ path: 'comment.png' })
      await this.timeout()
      await this.page.$eval('.submit', (el: HTMLElement) => el.click())
    })
  }

  async onPublishNoteResponse(data) {
    console.log('发布成功: ', data)
    this.emit('publish:success')
  }

  async publishNotice() {
    // todo 笔记发布有问题
    // token使用窜了
    // await this.page.goto('https://creator.xiaohongshu.com/publish/publish')
    // await this.timeout()
    // await this.page.screenshot({ path: 'notice_1.png' })
    // console.log('已更新notice_1')
    // const uploadInput = await this.page.waitForSelector('.upload-input')
    // await uploadInput.uploadFile(
    //   `/Users/joey/Desktop/文件/视频/1a78c8102cfb11ed8f7e1fdd57fdf4ce.mp4`
    // )
    // await this.timeout()
    // await this.page.waitForSelector('.c-input_inner')
    // await this.page.type('.c-input_inner', '可爱的小猫咪在洗澡也～', {
    //   delay: 50
    // })
    // await this.page.screenshot({ path: 'notice_1_1.png' })
    // await this.page.waitForSelector('.post-content', { timeout: 60 })
    // await this.page.type('.post-content', '前言：可爱的小猫咪在洗澡～', {
    //   delay: 50
    // })
    // // 出现封面 + 重新上传按钮才说明上传成功
    // await this.page.waitForSelector('.reUpload', {
    //   timeout: 1000 * 2 * 60
    // })
    // await this.page.waitForSelector('.coverImg', {
    //   timeout: 1000 * 2 * 60
    // })
    // await this.timeout()
    // await this.page.screenshot({ path: 'notice_2.png' })
    // await this.page.screenshot({ path: 'notice_3.png' })
    // await Promise.all([
    //   this.page.waitForSelector('._title'),
    //   this.page.waitForSelector('._title label')
    // ])
    // await this.page.$$eval('._title', (nodes: HTMLElement[]) => {
    //   // 设置私密
    //   nodes[1].querySelectorAll('label')[1].click()
    // })
    // await this.timeout()
    // await this.page.click('.publishBtn')
    // await this.page.screenshot({ path: 'notice_4.png' })
    // console.log('发布中')
  }

  async publicPicText(options: PublishOptions) {
    return new Promise(async (resolve, reject) => {
      let internalTimer = null
      let timer = setTimeout(() => {
        clearTimeout(timer)
        clearTimeout(internalTimer)
        reject('发布超时')
      }, 1000 * 3000)
      this.on('publish:success', () => {
        clearTimeout(timer)
        timer = null
        resolve('')
      })
      const { pictures, title, desc, isPublic, topics = [] } = options
      // topics = ['123木头人', '吉利银河L6', '水电费是不是我们家的']
      await this.page.goto('https://creator.xiaohongshu.com/publish/publish')
      await this.timeout()
      try {
        await this.page.waitForSelector('.login-box-container', { timeout: 1000 * 6 })
        reject('创作者账号已过期，需重新登录')
        console.log('创作者账号已过期，需重新登录')
        return
      } catch (error) {
        console.log('creator cookie正常登录')
      }
      await this.page.waitForSelector('.header .tab:nth-child(2)')
      await this.page.$eval('.header .tab:nth-child(2)', (el: HTMLElement) => {
        el.click()
      })
      const uploadInput = await this.page.waitForSelector('.upload-input')
      const indexPic = pictures[0]
      const otherPics = pictures.slice(1)
      // @ts-ignore: 11
      await uploadInput.uploadFile(indexPic)
      const moreUploadInput = await this.page.waitForSelector('.img-list .top input[type="file"]')
      console.log(moreUploadInput)
      for (let i = 0; i < otherPics.length; i++) {
        // @ts-ignore: 11
        const result = await moreUploadInput.uploadFile(otherPics[i])
        console.log('upload result: ', result)
      }
      await this.timeout()
      await this.page.waitForSelector('.c-input_inner')
      await this.page.type('.c-input_inner', title, {
        delay: 50
      })
      await this.page.waitForSelector('.post-content', { timeout: 60 })
      await this.page.type('.post-content', desc, {
        delay: 50
      })

      if (topics && topics.length) {
        await this.page.type('.post-content', '\n', {
          delay: 50
        })
        for (let i = 0; i < topics.length; i++) {
          await this.setTopic(topics[i])
        }
      }

      const awaitUploadSuccess = async () => {
        return new Promise((resolve) => {
          const checkFunction = async () => {
            const masks = await this.page.$$('.img-container .mask')
            const masksClass = await this.page.$$eval('.img-container .mask', (nodes) => {
              return nodes.map((e) => e.className.split(' ')).flat(10)
            })
            console.log('mask class: ', masksClass)
            const flag1 = masks.length === pictures.length
            const flag2 = !masksClass.includes('uploading')
            const flag3 = !masksClass.includes('failed')
            const flag4 = !masksClass.includes('prerender')
            if (flag1 && flag2 && flag3 && flag4) {
              console.log('call!')
              resolve('')
            } else {
              internalTimer = setTimeout(async () => {
                await checkFunction()
              }, 1000)
            }
          }
          checkFunction()
        })
      }
      await awaitUploadSuccess()
      console.log('1111')
      await Promise.all([
        this.page.waitForSelector('._title'),
        this.page.waitForSelector('._title label')
      ])
      if (isPublic) {
        await this.page.$$eval('._title', (nodes: HTMLElement[]) => {
          // 设置公开
          nodes[1].querySelectorAll('label')[0].click()
        })
      } else {
        await this.page.$$eval('._title', (nodes: HTMLElement[]) => {
          // 设置私密
          nodes[1].querySelectorAll('label')[1].click()
        })
      }
      await this.timeout()
      await this.page.click('.publishBtn')
      console.log('发布图文作品中..')
    })
  }

  async setTopic(topicText: string) {
    if (!topicText) {
      return console.log('topic not found!')
    }
    return new Promise(async (resolve) => {
      this.on(`topic:${topicText}`, async (topic_info_dtos: TopicItem[] = []) => {
        if (topic_info_dtos.length) {
          console.log('找到匹配的话题')
          const index = topic_info_dtos.findIndex((e) => e.name === topicText)
          if (index >= 0) {
            await this.page.$$eval(
              '.publish-topic-item',
              (nodes, index) => {
                const event = new MouseEvent('mousedown', {
                  view: window,
                  bubbles: true,
                  cancelable: true
                })
                nodes[index].dispatchEvent(event)
                console.log('dispatch!!', event, nodes, nodes[index])
              },
              index
            )
          } else {
            await this.page.type('.post-content', ' ', { delay: 50 })
          }
        } else {
          console.log('没有找到匹配的话题')
          await this.page.type('.post-content', ' ', { delay: 50 })
        }
        clearTimeout(timer)
        timer = null
        resolve('')
      })

      await this.page.type('.post-content', '#' + topicText, { delay: 50 })
      let timer = setTimeout(async () => {
        await this.page.type('.post-content', ' ', { delay: 50 })
        resolve('')
      }, 1000 * 10)
    })
  }

  async likeNote() {
    try {
      console.log('执行点赞：')
      const useSelector = `.left .like-wrapper .like-icon use`
      await this.page.waitForSelector(useSelector)
      const xlink = await this.page.$eval(useSelector, (node) => {
        return node.getAttribute('xlink:href')
      })
      if (xlink === '#liked') {
        console.log('目标笔记已经like，跳过')
        return '点赞成功'
      }
      await this.page.click('.left .like-wrapper')
      await this.timeout()
      return '点赞成功'
    } catch (error) {
      return error
    }
  }

  async collectNote() {
    try {
      console.log('执行收藏：')
      const useSelector = `.left .collect-wrapper .collect-icon use`
      await this.page.waitForSelector(useSelector)
      const xlink = await this.page.$eval(useSelector, (node) => {
        return node.getAttribute('xlink:href')
      })
      if (xlink === '#collected') {
        console.log('目标笔记已经like，跳过')
        return '收藏成功'
      }
      await this.page.click('.left .collect-wrapper')
      await this.timeout()
      return '收藏成功'
    } catch (error) {
      return error
    }
  }

  async commentNote(text: string) {
    return new Promise(async (resolve) => {
      try {
        const onCommentResponse = (payload, data) => {
          setTimeout(() => {
            resolve('评论超时，请重试')
            this.off('replyReponse', onCommentResponse)
          }, 1000 * 10)
          if (payload && payload.content && payload.content === text) {
            this.off('replyReponse', onCommentResponse)
            // console.log('data: ', data)
            if (data) {
              resolve('评论成功')
              console.log(data?.toast)
            }
          }
        }
        this.on('replyReponse', onCommentResponse)
        console.log('执行评论：', text)
        const selector = `.content-edit #content-textarea`
        await this.page.waitForSelector(selector)
        await this.page.type(selector, text, { delay: 100 })
        const btnSelector = `.right-btn-area .btn.submit`
        await this.page.waitForSelector(btnSelector)
        await this.page.$eval(btnSelector, (node: HTMLElement) => {
          node.click()
        })
        await this.timeout()
      } catch (error) {
        resolve('评论失败')
        log.error('commentNote: ', error)
      }
    })
  }

  async likeCollectComment(opts: NoteOperationOps) {
    const { note_link, isLike, isCollect, isComment, commentText } = opts
    const result: NoteOperationResult = {
      like: true,
      collect: true,
      comment: true
    }
    if (note_link) {
      await this.page.goto(note_link)
    }
    if (isLike) {
      result.likeMessage = await this.likeNote()
      await this.timeout(500)
    }
    if (isCollect) {
      result.collectMessage = await this.collectNote()
      await this.timeout(500)
    }
    if (isComment) {
      result.commentMessage = (await this.commentNote(commentText)) as any
      await this.timeout(500)
    }

    return result
  }
}
