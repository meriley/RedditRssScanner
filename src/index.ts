import { Client, CommandInteraction, Intents } from 'discord.js'
import { createRssScanner, initRssScanners, SubredditRssScanner } from 'rss'
import { token } from '../config.json'
import { initCommands } from './commands'
import { COMMANDS } from './constants'
import { upsertChannelSubscriber, upsertSubreddit } from './db'
import { addMemberToLatestThread, initializeThreads, initThreadsJob, removeMemberFromLatestThread } from './discord'

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] })

// Manage RSS Scanners
const rssScanners: { [channelId: string]: SubredditRssScanner } = {}

// When the client is ready, run this code (only once)
client.on('ready', () => {
  console.log('Game News Bot Running')
  client.guilds.cache.forEach(guild => initCommands(guild.id))
  initThreadsJob(client)
  initRssScanners(client, (channelId: string, scanner: SubredditRssScanner) => (rssScanners[channelId] = scanner))
})

client.on('interactionCreate', async (interaction: CommandInteraction) => {
  if (!interaction.isCommand()) return

  const { commandName, channelId, options, user, reply } = interaction
  switch (commandName) {
    case COMMANDS.SUBSCRIBE:
      addMemberToLatestThread({
        client,
        channelId: channelId,
        memberId: user.id,
      })
      await reply('You have been subscribed to recieve news notifications in this channel. To unsubscribe use command /unsubscribe')
      break
    case COMMANDS.UNSUBSCRIBE:
      removeMemberFromLatestThread({
        client,
        channelId: channelId,
        memberId: user.id,
      })
      await reply('You have been unsubscribed from news notifications in this channel.')
      break
    case COMMANDS.ENABLE:
      const subredditId = options.getString('subreddit')
      if (subredditId) {
        upsertSubreddit({ active: true, channelId, subredditId })
        upsertChannelSubscriber({ id: channelId, subredditId, active: true })
        initializeThreads(client)
        rssScanners[channelId] = createRssScanner({ client, channelId, subredditId })
        await reply(`News updates for ${subredditId} have been enabled for this channel`)
      } else {
        await reply('Subscription Failed: You must provide a news id.')
      }
      break
    case COMMANDS.DISABLE:
      upsertChannelSubscriber({ id: channelId, subredditId: rssScanners[channelId]?.getSubredditId() || '', active: false })
      await reply('News updates have been disabled for this channel')
      break
  }
})

// Login to Discord with your client's token
client.login(token)
