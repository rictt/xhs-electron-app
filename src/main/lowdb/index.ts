import { LowSync } from 'lowdb'
import { JSONFileSync } from 'lowdb/node'
import { app } from 'electron'
import { join } from 'path'

type Data = {
  // accounts: AccountItem[]
  accounts: XhsAccount[]
  notes: NoteDataItem[]
}

class SystemDB {
  db: LowSync<Data>
  get data() {
    return this.db.data
  }
  constructor() {
    const defaultData: Data = {
      accounts: [],
      notes: []
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
    // const ids = []
    // this.db.data.accounts = this.db.data.accounts.filter((e) => {
    //   if (ids.includes(e.user_id)) {
    //     return false
    //   }
    //   ids.push(e.user_id)
    //   return true
    // })
    // await this.db.write()
    await this.db.read()
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
}

export const systemDb = new SystemDB()
