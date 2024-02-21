declare type TestType = {
  name: string
}

declare type CookieStatus = 'empty' | 'normal' | 'invalid'

declare interface XhsAccount {
  baseCookie: string
  creatorCookie: string

  baseStatus?: CookieStatus
  creatorStatus?: CookieStatus

  guest: boolean
  red_id: string
  user_id: string
  nickname: string
  desc: string
  gender: number
  images: string
  imageb: string
}

type NoteStatus = 'monitor' | 'idle'
declare interface NoteDataItem {
  note_href: string
  note_id: string
  user_id: string
  title: string
  count: string
  cover: string
  status?: NoteStatus
  reply_text?: string
  monitor_id?: string
}

declare interface CommentDataItem {
  note_id: string
  target_comment_id: string
  content: string
}

declare interface ArticleDataItem {
  id: string
  user_id: string
  title: string
  desc: string

  account?: XhsAccount
  pictures?: string[]
  channel?: string
  create_time: number
}

declare interface CreateNewsForm {
  accounts: XhsAccount[]
  title: string
  desc: string
  pictures: string[]
  topics?: string[]
  isPublic: boolean
}

declare interface CreateNoteForm {
  account: XhsAccount
  title: string
  desc: string
  pictures: string[]
  topics?: string[]
  isPublic: boolean
}

declare interface PublishResult {
  account: XhsAccount
  success: boolean
  message: string
}
declare type PublishResultList = PublishResult[]
declare interface PublishOptions {
  pictures: string[]
  title: string
  desc: string
  isPublic?: boolean
  topics?: string[]
}

declare interface TopicItem {
  id: string
  name: string
  link: string
  view_num: number
  type: string
  smart: boolean
}

declare interface NoteOperationOps {
  account?: XhsAccount
  note_link: string

  isLike?: boolean
  isCollect?: boolean
  isComment?: boolean

  commentText?: string
}

declare interface NoteOperationResult {
  like: boolean
  likeMessage?: string

  collect: boolean
  collectMessage?: string

  comment: boolean
  commentMessage?: string
}
