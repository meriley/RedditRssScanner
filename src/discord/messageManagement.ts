import { getNewestThread, ThreadRow } from 'db'
import { BaseGuildTextChannel, Client, MessageEmbed, MessageOptions, MessagePayload, ThreadChannel } from 'discord.js'

export async function sendMessage({ client, channelId, message }: { client: Client; channelId: string; message: MessageEmbed }) {
  getNewestThread({
    channelId,
    callback: async (row: ThreadRow) => {
      const channel: BaseGuildTextChannel = (await client.channels.fetch(channelId)) as BaseGuildTextChannel
      const thread: ThreadChannel | null = await channel.threads.fetch(row.id)
      if (thread) {
        const options: MessageOptions = {
          embeds: [message],
        }
        const payload = new MessagePayload(thread, options)
        thread.send(payload)
      }
    },
  })
}
