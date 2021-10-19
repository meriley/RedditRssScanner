import { Database, OPEN_READONLY, OPEN_READWRITE } from 'sqlite3'

export type ChannelRow = {
  id: string
  subredditId: string
  active: boolean
}

const upsertChannelSubscriberSQL = 'INSERT INTO channel_subscribers (id, subreddit_id, active) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET subreddit_id=excluded.subreddit_id, active=excluded.active'
const getActiveChannelSubscribersSQL = 'SELECT id, subreddit_id, active FROM channel_subscribers WHERE active=1'

export function upsertChannelSubscriber({ active, id: channelId, subredditId }: ChannelRow): void {
  const db = new Database('db/gamesnewsbot.db', OPEN_READWRITE)
  db.run(upsertChannelSubscriberSQL, channelId, subredditId, active ? 1 : 0, err => {
    if (err) {
      throw err
    }
  })
  db.close()
}

export function getActiveChannelSubscribers(callback: (channelRow: ChannelRow) => void): void {
  const db = new Database('db/gamesnewsbot.db', OPEN_READONLY)
  db.each(getActiveChannelSubscribersSQL, (err, row) => {
    if (err) {
      throw err
    }
    callback({
      id: row.id,
      subredditId: row.subreddit_id,
      active: row.active > 0 ? true : false,
    })
  })
  db.close()
}
