import { LowSync } from 'lowdb'
import { JSONFileSync } from 'lowdb/node'
import { app } from 'electron'
import { join } from 'path'

type AccountItem = {
  ownerId: string
  baseCookie: string
  creatorCookie?: string
  id: string
}
type NoteStatus = 'monitor' | 'idle'

type NoteItem = {
  id: string
  noteHref: string
  title: string
  count: string
  cover: string
  status?: NoteStatus
}

type Data = {
  accounts: AccountItem[]
  notes: NoteItem[]
}

export async function initDB() {
  const defaultData = {
    accounts: [],
    notes: []
  }

  const filePath = join(app.getPath('userData'), 'db.json')
  console.log('filePath: ', filePath)
  const adapter = new JSONFileSync<Data>(filePath)
  const db = new LowSync(adapter, defaultData)

  await db.read()
  return db
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

  async init() {
    await this.db.read()
  }

  async addAccount(account: AccountItem) {
    account.id = Date.now() + ''
    this.db.data.accounts.push(account)
    await this.db.write()
  }
  async removeAccount(accountId: string) {
    this.db.data.accounts = this.db.data.accounts.filter((e) => e.id !== accountId)
    await this.db.write()
  }

  async addNote(note: NoteItem) {
    note.status = note.status || 'idle'
    this.db.data.notes.push(note)
    await this.db.write()
  }

  async removeNote(noteId: string) {
    this.db.data.notes = this.db.data.notes.filter((e) => e.id !== noteId)
    await this.db.write()
  }

  async updateNoteStatus(id: string, status: NoteStatus) {
    const target = this.db.data.notes.find((e) => e.id === id)
    if (target) {
      target.status = status
    }
    await this.db.write()
  }
}

export const systemDb = new SystemDB('system')
