import { Database, OPEN_READWRITE } from 'sqlite3'

export type RssFilterRow = {
  id: string
  subredditId: string
  filterType: string
  targetText: string
  exact: boolean
  createdAt: string
}

const upsertRssFilterSQL =
  'INSERT INTO rss_filters (id, subreddit_id, filter_type, target_text, exact) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET subreddit_id=excluded.subreddit_id, filter_type=excluded.filter_type, target_text=excluded.target_text, exact=excluded.exact'
const getRssFilterSQL = 'SELECT target_text FROM rss_filters WHERE subreddit_id=?, filter_type=?'

export function upsertSubreddit({ subredditId, filterType, targetText, exact }: RssFilterRow) {
  const db = new Database('db/gamesnewsbot.db', OPEN_READWRITE)
  db.run(upsertRssFilterSQL, `${subredditId}_${filterType}_${targetText}`, subredditId, filterType, targetText, exact ? 1 : 0, (err, _) => {
    if (err) {
      throw err
    }
  })
  db.close()
}
