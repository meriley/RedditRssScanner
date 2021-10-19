import { Database, OPEN_READONLY, OPEN_READWRITE } from 'sqlite3'

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
const getRssFilterSQL = 'SELECT id, subreddit_id, filter_type, target_text, exact, created_at FROM rss_filters WHERE subreddit_id=?'

export function upsertRssFilter({ subredditId, filterType, targetText, exact }: RssFilterRow) {
  const db = new Database('db/gamesnewsbot.db', OPEN_READWRITE)
  db.run(upsertRssFilterSQL, `${subredditId}_${filterType}_${targetText}`, subredditId, filterType, targetText, exact ? 1 : 0, (err, _) => {
    if (err) {
      throw err
    }
  })
  db.close()
}

export function getRssFiltersForChannel({ subredditId, callback }: { subredditId: string; callback: (row: RssFilterRow | undefined) => void }) {
  const db = new Database('db/gamesnewsbot.db', OPEN_READONLY)
  db.each(getRssFilterSQL, subredditId, (err, row) => {
    if (err) {
      throw err
    }

    callback(
      row
        ? {
            id: row.id,
            subredditId: row.subreddit_id,
            filterType: row.fiter_type,
            targetText: row.target_text,
            exact: row.exact == 1 ? true : false,
            createdAt: row.created_at,
          }
        : undefined
    )
  })
  db.close()
}
