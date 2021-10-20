import { Database } from 'sqlite3'

export type ChannelRow = {
  id: string
  subredditId: string
  active: boolean
}

const upsertChannelSubscriberSQL = 'INSERT INTO channel_subscribers (id, subreddit_id, active) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET subreddit_id=excluded.subreddit_id, active=excluded.active'
const getActiveChannelSubscribersSQL = 'SELECT id, subreddit_id, active FROM channel_subscribers WHERE active=1'

export function upsertChannelSubscriber(db: Database, { active, id: channelId, subredditId }: ChannelRow): void {
  db.run(upsertChannelSubscriberSQL, channelId, subredditId, active ? 1 : 0, err => {
    if (err) {
      throw err
    }
  })
}

export function getActiveChannelSubscribers(db: Database, callback: (channelRow: ChannelRow) => void): void {
  db.each(getActiveChannelSubscribersSQL, (err, row) => {
    if (err) {
      throw err
    }
    if (row) {
      callback({
        id: row.id,
        subredditId: row.subreddit_id,
        active: row.active > 0 ? true : false,
      })
    }
  })
}
