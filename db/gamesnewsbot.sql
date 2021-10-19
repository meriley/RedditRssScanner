CREATE TABLE IF NOT EXISTS threads (
  id TEXT NOT NULL PRIMARY KEY,
  channel_id TEXT NOT NULL,
  created_at DATE DEFAULT (datetime('now','localtime')),
  FOREIGN KEY(channel_id) REFERENCES channel_subscribers(id)
);

CREATE TABLE IF NOT EXISTS thread_subscribers (
  id TEXT NOT NULL PRIMARY KEY,
  member_id TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  active INTEGER NO NULL,
  created_at DATE DEFAULT (datetime('now','localtime')),
  FOREIGN KEY(channel_id) REFERENCES channel_subscribers(id)
);
  
CREATE TABLE IF NOT EXISTS channel_subscribers (
  id TEXT NOT NULL PRIMARY KEY,
  subreddit_id TEXT NOT NULL,
  active INTEGER NOT NULL,
  created_at DATE DEFAULT (datetime('now','localtime')),
  FOREIGN KEY(subreddit_id) REFERENCES subreddit(subreddit_id)
);

CREATE TABLE IF NOT EXISTS subreddits (
  id TEXT NOT NULL PRIMARY KEY,
  subreddit_id TEXT NOT NULL, 
  channel_id TEXT NOT NULL,
  active INTEGER NOT NULL,
  created_at DATE DEFAULT (datetime('now','localtime')),
  FOREIGN KEY(channel_id) REFERENCES channel_subscribers(id)
);

CREATE TABLE IF NOT EXISTS rss_filters (
  id TEXT NOT NULL PRIMARY KEY,
  subreddit_id TEXT NOT NULL,
  filter_type TEXT NOT NULL,
  target_text TEXT NOT NULL,
  exact INTEGER NOT NULL,
  created_at DATE DEFAULT (datetime('now','localtime')),
  FOREIGN KEY(subreddit_id) REFERENCES subreddit(subreddit_id)
);