import { Database } from 'sqlite3'

export type SubredditRow = {
  id?: string
  subredditId: string
  channelId: string
  active: boolean
  createdAt?: string
}

const upsertSubredditSQL = 'INSERT INTO subreddits (id, subreddit_id, channel_id, active) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET subreddit_id=excluded.subreddit_id, channel_id=excluded.channel_id, active=excluded.active'
const getChannelSubredditSQL = 'SELECT subreddit_id FROM subreddits WHERE channel_id=? AND active=1'

export function upsertSubreddit(db: Database, { subredditId, channelId, active }: SubredditRow) {
  db.run(upsertSubredditSQL, `${channelId}_${subredditId}`, subredditId, channelId, active ? 1 : 0, (err, _) => {
    if (err) {
      throw err
    }
  })
}

export function getChannelSubreddit(db: Database, channelId: string) {
  db.run(getChannelSubredditSQL, channelId, (err, _) => {
    if (err) {
      throw err
    }
  })
}
