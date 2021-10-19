import { Database, OPEN_READWRITE } from 'sqlite3'

export type SubredditRow = {
  id?: string
  subredditId: string
  channelId: string
  active: boolean
  createdAt?: string
}

const upsertSubredditSQL = 'INSERT INTO subreddits (id, subreddit_id, channel_id, active) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET subreddit_id=excluded.subreddit_id, channel_id=excluded.channel_id, active=excluded.active'
const getChannelSubredditSQL = 'SELECT subreddit_id FROM subreddits WHERE channel_id=? AND active=1'

export function upsertSubreddit({ subredditId, channelId, active }: SubredditRow) {
  const db = new Database('db/gamesnewsbot.db', OPEN_READWRITE)
  db.run(upsertSubredditSQL, `${channelId}_${subredditId}`, subredditId, channelId, active ? 1 : 0, (err, _) => {
    if (err) {
      throw err
    }
  })
  db.close()
}

export function getChannelSubreddit(channelId: string) {
  const db = new Database('db/gamesnewsbot.db', OPEN_READWRITE)
  db.run(getChannelSubredditSQL, channelId, (err, _) => {
    if (err) {
      throw err
    }
  })
  db.close()
}
