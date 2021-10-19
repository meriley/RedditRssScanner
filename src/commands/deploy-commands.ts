import { SlashCommandBuilder } from '@discordjs/builders'
import { REST } from '@discordjs/rest'
import { COMMANDS } from '../constants'
import { Routes } from 'discord-api-types/v9'
import { clientId, token } from '../../config.json'

export function initCommands(guildId: string): void {
  const commands = [
    new SlashCommandBuilder().setName(COMMANDS.SUBSCRIBE).setDescription('Subscribe to daily news notifications'),
    new SlashCommandBuilder().setName(COMMANDS.UNSUBSCRIBE).setDescription('Unsubscribe from daily news notifications'),
    new SlashCommandBuilder()
      .setName(COMMANDS.ENABLE)
      .setDescription('Enable news on this channel')
      .addStringOption(option => option.setName('subreddit').setDescription('The subreddit name that follows reddit.com/r/')),
    new SlashCommandBuilder().setName(COMMANDS.DISABLE).setDescription('Disable news on this channel'),
    new SlashCommandBuilder()
      .setName(COMMANDS.ADD_FILTER)
      .setDescription('Add a value to filter news results by')
      .addStringOption(option => option.setName('filter').setDescription('The text or regex you wish to filter on'))
      .addBooleanOption(option => option.setName('exact').setDescription('Should this be an exact match or is it a regex?')),
    new SlashCommandBuilder()
      .setName(COMMANDS.ADD_FILTER)
      .setDescription('Add a value to filter news results by')
      .addStringOption(option => option.setName('filter').setDescription('The text or regex you wish to filter on'))
      .addBooleanOption(option => option.setName('exact').setDescription('Should this be an exact match or is it a regex?')),
    new SlashCommandBuilder()
      .setName(COMMANDS.REMOVE_FILTER)
      .setDescription('Remove a filtered value')
      .addStringOption(option => option.setName('id').setDescription('Filter id can be retrieved using /listFilters')),
    new SlashCommandBuilder().setName(COMMANDS.LIST_FILTER).setDescription('List filter values for this channel'),
  ].map(command => command.toJSON())

  const rest = new REST({ version: '9' }).setToken(token)

  rest
    .put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error)
}
