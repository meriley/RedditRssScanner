import { SlashCommandBuilder } from '@discordjs/builders'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import { clientId, token } from '../../config.json'

export function initCommands(guildId: string): void {
  const commands = [
    new SlashCommandBuilder().setName('subscribe').setDescription('Subscribe to daily news notifications'),
    new SlashCommandBuilder().setName('unsubscribe').setDescription('Unsubscribe from daily news notifications'),
    new SlashCommandBuilder()
      .setName('enable')
      .setDescription('Enable news on this channel')
      .addIntegerOption(option => option.setName('subreddit').setDescription('The subreddit name that follows reddit.com/r/')),
    new SlashCommandBuilder().setName('disable').setDescription('Disable news on this channel'),
  ].map(command => command.toJSON())

  const rest = new REST({ version: '9' }).setToken(token)

  rest
    .put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error)
}
