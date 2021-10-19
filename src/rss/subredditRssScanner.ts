import RssFeedEmitter from 'rss-feed-emitter'
import { FiltersType } from '../static/schema.js'
import TurndownService from 'turndown'
import { getEmbeddedContent } from './content'
import { isExactMatch, isRegexMatch } from './filters.js'

export type RssType = {
  [key: string]: {
    id: string
    name: string
    url: string
    filters?: FiltersType
    webhooks: string[]
  }
}

export class SubredditRssScanner {
  feeder: any
  constructor() {
    this.feeder = new RssFeedEmitter()
  }

  addRssSource({ url, callback }: { url: string; callback: (params: { categories: string[]; message: any }) => void }) {
    this.feeder.add({
      url: url,
      refresh: 30000,
    })
    console.log('Started watching RSS feed at', url)

    this.feeder.on('new-item', function (item: any) {
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

      console.log(item.categories)

      const author = uAuthor.substring(3) // Remove the `/u/`
      const hasAuthorMatch = isExactMatch(author, rss[categories[0]]?.filters?.author?.exact) || isRegexMatch(author, rss[categories[0]].filters?.author?.regex)
      const hasTitleMatch = isExactMatch(title, rss[categories[0]]?.filters?.title?.exact) || isRegexMatch(title, rss[categories[0]].filters?.title?.regex)

      if (!hasAuthorMatch && !hasTitleMatch) {
        return
      }

      const contentMarkDown = new TurndownService().turndown(description)
      const embeddedContent = getEmbeddedContent(contentMarkDown)

      const message = {
        content: url,
        embeds: [
          {
            title,
            url,
            author: { name: author },
            thumbnail: { url: embeddedContent.image || imgUrl },
            fields: [{ name: 'Summary:', value: embeddedContent.summary }],
          },
        ],
      }

      callback({ categories, message })
    })
  }
}

module.exports = RedditRss
