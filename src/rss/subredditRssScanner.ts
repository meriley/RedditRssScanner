import { MessageEmbed } from 'discord.js'
import RssFeedEmitter from 'rss-feed-emitter'
import { Database } from 'sqlite3'
import TurndownService from 'turndown'
import { RSS_FILTER_TYPES } from '../constants'
import { getRssFiltersForChannel, RssFilterRow } from '../db'
import { getEmbeddedContent } from './helpers/content'
import { isExactMatch, isRegexMatch } from './helpers/filters.js'

export class SubredditRssScanner {
  feeder: any
  subredditId: string
  db: Database
  constructor(db: Database, subredditId: string) {
    this.feeder = new RssFeedEmitter()
    this.subredditId = subredditId
    this.db = db
  }

  public getSubredditId(): string {
    return this.subredditId
  }

  public getDatabase(): Database {
    return this.db
  }

  public start(callback: (message: MessageEmbed) => void) {
    const url = `https://www.reddit.com/r/${this.subredditId}/new/.rss`
    this.feeder.add({
      url,
      refresh: 30000,
    })
    feeder.on('error', console.error)
    console.log(`Started watching RSS feed at ${url}`)

    this.feeder.on('new-item', (item: any) => {
      const {
        title,
        link: url,
        description,
        author: uAuthor,
        categories,
        meta: {
          image: { url: imgUrl },
        },
      } = item

      const author = uAuthor.substring(3) // Remove the `/u/`
      const filterCallback = (row: RssFilterRow) => {
        let isMatch: boolean = false
        switch (row.filterType) {
          case RSS_FILTER_TYPES.AUTHOR:
            isMatch = row.exact ? isExactMatch(author, row.targetText) : isRegexMatch(author, row.targetText)
            break
          case RSS_FILTER_TYPES.TITLE:
            isMatch = row.exact ? isExactMatch(title, row.targetText) : isRegexMatch(title, row.targetText)
            break
        }

        if (isMatch) {
          const contentMarkDown = new TurndownService().turndown(description)
          const embeddedContent = getEmbeddedContent(contentMarkDown)

          const message: MessageEmbed = new MessageEmbed()
          message.title = title
          message.url = url
          message.author = { name: author }
          message.thumbnail = { url: embeddedContent.image || imgUrl }
          message.fields = [{ name: 'Summary:', value: embeddedContent.summary, inline: true }]

          callback(message)
        }
      }
      getRssFiltersForChannel(this.db, { subredditId: this.subredditId, callback: filterCallback })
    })
  }
}
