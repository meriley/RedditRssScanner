import { Database, OPEN_READONLY, OPEN_READWRITE } from 'sqlite3'

export type ThreadRow = {
  id: string
  channelId: string
  createdAt?: string
}

const getNewestThreadSQL = 'SELECT id, channel_id, created_at FROM threads WHERE channel_id=? ORDER BY created_at DESC LIMIT 1'
const addThreadSQL = 'INSERT INTO threads (id, channel_id) VALUES (?, ?)'

export function getNewestThread({ channelId, callback }: { channelId: string; callback: (row: ThreadRow | undefined) => void }) {
  const db = new Database('db/gamesnewsbot.db', OPEN_READONLY)
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
  db.close()
}

export function addThread({ channelId, id: threadId }: ThreadRow) {
  const db = new Database('db/gamesnewsbot.db', OPEN_READWRITE)
  db.run(addThreadSQL, channelId, threadId, (err, _) => {
    if (err) {
      throw err
    }
  })
  db.close()
}
