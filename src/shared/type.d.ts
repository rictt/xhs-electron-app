declare type TestType = {
  name: string
}

declare interface XhsAccount {
  baseCookie: string
  creatorCookie: string
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
  isPublic: boolean
}

declare interface PublishOptions {
  pictures: string[]
  title: string
  desc: string
  isPublic?: boolean
}
