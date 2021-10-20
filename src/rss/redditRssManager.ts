import { Client, MessageEmbed } from 'discord.js'
import { Database } from 'sqlite3'
import { ChannelRow, getActiveChannelSubscribers } from '../db'
import { sendMessage } from '../discord/messageManagement'
import { SubredditRssScanner } from './subredditRssScanner'

export function initRssScanners(client: Client, db: Database, callback: (channelId: string, scanner: SubredditRssScanner) => void) {
  console.log('initializing rss feeds')
  getActiveChannelSubscribers(db, (channelRow: ChannelRow) => {
    const scanner = createRssScanner({ client, channelId: channelRow.id, db, subredditId: channelRow.subredditId })
    callback(channelRow.id, scanner)
  })
}

export function createRssScanner({ client, channelId, db, subredditId }: { client: Client; channelId: string; db: Database; subredditId: string }): SubredditRssScanner {
  const rssScanner = new SubredditRssScanner(db, subredditId)
  rssScanner.start((message: MessageEmbed) => sendMessage({ client, channelId, db, message }))
  return rssScanner
}
