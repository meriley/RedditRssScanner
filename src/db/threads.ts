import { Database } from 'sqlite3'

export type ThreadRow = {
  id: string
  channelId: string
  createdAt?: string
}

const getNewestThreadSQL = 'SELECT id, channel_id, created_at FROM threads WHERE channel_id=? ORDER BY created_at DESC LIMIT 1'
const addThreadSQL = 'INSERT INTO threads (id, channel_id) VALUES (?, ?)'

export function getNewestThread(db: Database, { channelId, callback }: { channelId: string; callback: (row: ThreadRow | undefined) => void }) {
  db.get(getNewestThreadSQL, channelId, (err, row) => {
    if (err) {
      throw err
    }
    callback(
      row
        ? {
            id: row.id,
            channelId: row.channel_id,
            createdAt: row.created_at,
          }
        : undefined
    )
  })
}

export function addThread(db: Database, { channelId, id: threadId }: ThreadRow) {
  db.run(addThreadSQL, threadId, channelId, (err, _) => {
    if (err) {
      throw err
    }
  })
}
