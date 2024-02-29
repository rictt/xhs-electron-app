import { LowSync } from 'lowdb'
import { JSONFileSync } from 'lowdb/node'
import { app } from 'electron'
import { join } from 'path'

type Data = {
  // 一台机器一个，默认写入本地
  // 填写授权码的时候，顺便把use_id带上
  // 跟授权码进行关联，如果一个授权码使用期内，超过3个，就禁止使用
  use_id: string
  accounts: XhsAccount[]
  notes: NoteDataItem[]
  comments: CommentDataItem[]
  articles: ArticleDataItem[]
}

class SystemDB {
  db: LowSync<Data>
  get data() {
    return this.db.data
  }
  constructor() {
    const defaultData: Data = {
      use_id: '',
      accounts: [],
      notes: [],
      comments: [],
      articles: []
    }
    const filePath = join(app.getPath('userData'), 'system' + '.json')
    const adapter = new JSONFileSync<Data>(filePath)
    const db = new LowSync<Data>(adapter, defaultData)
    this.db = db
  }

  async clean() {
    // this.data.accounts = []
    this.data.notes = []
    await this.db.write()
  }

  async init() {
    await this.db.read()
    if (!this.db.data.use_id) {
      this.db.data.use_id =
        Math.random().toString(16).slice(-12) + Math.random().toString(16).slice(-12)
      await this.db.write()
    }
    console.log('use_id: ', this.db.data.use_id)
  }

  async addAccount(account: XhsAccount) {
    // account.user_id = Date.now() + ''
    this.db.data.accounts.push(account)
    await this.db.write()
  }
  async removeAccount(accountId: string) {
    this.db.data.accounts = this.db.data.accounts.filter((e) => e.user_id !== accountId)
    await this.db.write()
  }

  async addNote(note: NoteDataItem) {
    note.status = note.status || 'idle'
    this.db.data.notes.push(note)
    await this.db.write()
  }

  async removeNote(noteId: string) {
    this.db.data.notes = this.db.data.notes.filter((e) => e.note_id !== noteId)
    await this.db.write()
  }

  async updateNoteStatus(id: string, status: NoteStatus) {
    const target = this.db.data.notes.find((e) => e.note_id === id)
    if (target) {
      target.status = status
    }
    await this.db.write()
  }

  async updateNote(id: string, key: string, value: any) {
    const target = this.db.data.notes.find((e) => e.note_id === id)
    if (target) {
      console.log('write: ', key, value)
      target[key] = value
    }
    this.db.data.notes = [...this.db.data.notes]
    await this.db.write()
    console.log(this.db.data.notes[this.db.data.notes.length - 1])
  }

  async updateArticle(id: string, key: string, value: any) {
    const target = this.db.data.articles.find((e) => e.id === id)
    if (target) {
      target[key] = value
    }
    this.db.data.articles = [...this.db.data.articles]
    await this.db.write()
  }
}

export const systemDb = new SystemDB()
