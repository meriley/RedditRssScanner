import { ChannelRow, getActiveChannelSubscribers } from 'db'
import { Client, MessageEmbed } from 'discord.js'
import { sendMessage } from 'discord/messageManagement'
import { SubredditRssScanner } from 'rss'

export function initRssScanners(client: Client, callback: (channelId: string, scanner: SubredditRssScanner) => void) {
  getActiveChannelSubscribers((channelRow: ChannelRow) => {
    const scanner = createRssScanner({ client, channelId: channelRow.id, subredditId: channelRow.subredditId })
    callback(channelRow.id, scanner)
  })
}

export function createRssScanner({ client, channelId, subredditId }: { client: Client; channelId: string; subredditId: string }): SubredditRssScanner {
  const rssScanner = new SubredditRssScanner(subredditId)
  rssScanner.start((message: MessageEmbed) => sendMessage({ client, channelId, message }))
  return rssScanner
}
