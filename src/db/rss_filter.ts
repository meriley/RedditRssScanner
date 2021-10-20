import { Database } from 'sqlite3'

export type RssFilterRow = {
  id?: string
  subredditId: string
  filterType: string
  targetText: string
  exact: boolean
  createdAt?: string
}

const upsertRssFilterSQL =
  'INSERT INTO rss_filters (id, subreddit_id, filter_type, target_text, exact) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET subreddit_id=excluded.subreddit_id, filter_type=excluded.filter_type, target_text=excluded.target_text, exact=excluded.exact'
const getRssFilterSQL = 'SELECT id, subreddit_id, filter_type, target_text, exact, created_at FROM rss_filters WHERE subreddit_id=?'
const deleteRssFilterSQL = 'DELETE FROM rss_filters WHERE id=?'

export function upsertRssFilter(db: Database, { subredditId, filterType, targetText, exact }: RssFilterRow) {
  db.run(upsertRssFilterSQL, `${subredditId}_${filterType}_${targetText}`, subredditId, filterType, targetText, exact ? 1 : 0, (err, _) => {
    if (err) {
      throw err
    }
  })
}

export function getRssFiltersForChannel(db: Database, { subredditId, callback }: { subredditId: string; callback: (row: RssFilterRow) => void }) {
  db.each(getRssFilterSQL, subredditId, (err, row) => {
    if (err) {
      throw err
    }

    if (row) {
      callback({
        id: row.id,
        subredditId: row.subreddit_id,
        filterType: row.filter_type,
        targetText: row.target_text,
        exact: row.exact == 1 ? true : false,
        createdAt: row.created_at,
      })
    }
  })
}

export function removeRssFilter(db: Database, filterId: string) {
  db.run(deleteRssFilterSQL, filterId, (err, _) => {
    if (err) {
      throw err
    }
  })
}
