import { Client, CommandInteraction, Intents } from 'discord.js'
import { Database, OPEN_READWRITE } from 'sqlite3'
import { token } from '../config.json'
import { initCommands } from './commands'
import { COMMANDS } from './constants'
import { removeRssFilter, upsertChannelSubscriber, upsertRssFilter, upsertSubreddit } from './db'
import { addMemberToLatestThread, initializeThreads, initThreadsJob, removeMemberFromLatestThread } from './discord'
import { createRssScanner, initRssScanners, SubredditRssScanner } from './rss'

// Create a new client instance
let db: Database
const client = new Client({ intents: [Intents.FLAGS.GUILDS] })

// Manage RSS Scanners
const rssScanners: { [channelId: string]: SubredditRssScanner } = {}

// When the client is ready, run this code (only once)
client.on('ready', () => {
  console.log('Game News Bot Running')
  client.guilds.cache.forEach(guild => initCommands(guild.id))
  db = new Database('db/gamesnewsbot.db', OPEN_READWRITE)
  initThreadsJob(client, db)
  initRssScanners(client, db, (channelId: string, scanner: SubredditRssScanner) => (rssScanners[channelId] = scanner))
})

client.on('interactionCreate', async (interaction: CommandInteraction) => {
  if (!interaction.isCommand()) return

  const { commandName, channelId, options, user } = interaction
  switch (commandName) {
    case COMMANDS.SUBSCRIBE:
      addMemberToLatestThread({
        client,
        channelId: channelId,
        db,
        memberId: user.id,
      })
      await interaction.reply('You have been subscribed to recieve news notifications in this channel. To unsubscribe use command /unsubscribe')
      break
    case COMMANDS.UNSUBSCRIBE:
      removeMemberFromLatestThread({
        client,
        channelId: channelId,
        db,
        memberId: user.id,
      })
      await interaction.reply('You have been unsubscribed from news notifications in this channel.')
      break
    case COMMANDS.ENABLE:
      const subredditId = options.getString('subreddit')
      if (subredditId) {
        db.serialize(() => {
          upsertSubreddit(db, { active: true, channelId, subredditId })
          upsertChannelSubscriber(db, { id: channelId, subredditId, active: true })
          initializeThreads(client, db)
          rssScanners[channelId] = createRssScanner({ client, channelId, db, subredditId })
        })
        await interaction.reply(`News updates for ${subredditId} have been enabled for this channel`)
      } else {
        await interaction.reply('Subscription Failed: You must provide a news id.')
      }
      break
    case COMMANDS.DISABLE:
      upsertChannelSubscriber(db, { id: channelId, subredditId: rssScanners[channelId]?.getSubredditId() || '', active: false })
      await interaction.reply('News updates have been disabled for this channel')
      break
    case COMMANDS.ADD_FILTER:
      const filterType = options.getString('type') || ''
      const targetText = options.getString('filter') || ''
      const exact = options.getBoolean('exact') || true
      upsertRssFilter(db, { subredditId: rssScanners[channelId]?.getSubredditId() || '', exact, filterType, targetText })
      await interaction.reply(`Filter added for ${filterType} ${targetText}`)
      break
    case COMMANDS.REMOVE_FILTER:
      const filterId = options.getString('id') || ''
      removeRssFilter(db, filterId)
      break
  }
})

// Login to Discord with your client's token
client.login(token)
