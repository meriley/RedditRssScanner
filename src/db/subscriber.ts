import { Database, OPEN_READWRITE } from 'sqlite3'

export type ThreadSubscriberRow = {
  memberId: string
  channelId: string
  createdAt: string
}

const upsertThreadSQL = 'INSERT INTO thread_subscribers (id, member_id, channel_id,active) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET member_id=excluded.member_id, channel_id=excluded.channel_id'
const getThreadSubscribersSQL = 'SELECT member_id, channel_id FROM thread_subscribers WHERE channel_id=? AND active=1'

export function upsertThreadSubscriber({ channelId, memberId, active }: { channelId: string; memberId: string; active: boolean }) {
  const db = new Database('db/gamesnewsbot.db', OPEN_READWRITE)
  db.run(upsertThreadSQL, `${channelId}_${memberId}`, memberId, channelId, active ? 1 : 0, (err, _) => {
    if (err) {
      throw err
    }
  })
  db.close()
}

export function getThreadSubscribers({ channelId, callback }: { channelId: string; callback: (row: ThreadSubscriberRow | undefined) => void }) {
  const db = new Database('db/gamesnewsbot.db', OPEN_READWRITE)
  db.each(getThreadSubscribersSQL, channelId, (err, row) => {
    if (err) {
      throw err
    }

    callback(
      row
        ? {
            memberId: row.member_id,
            channelId: row.channel_id,
            createdAt: row.created_at,
          }
        : undefined
    )
  })
  db.close()
}
