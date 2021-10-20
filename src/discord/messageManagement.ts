import { BaseGuildTextChannel, Client, MessageEmbed, MessageOptions, MessagePayload, ThreadChannel } from 'discord.js'
import { Database } from 'sqlite3'
import { getNewestThread, ThreadRow } from '../db'

export async function sendMessage({ client, channelId, db, message }: { client: Client; channelId: string; db: Database; message: MessageEmbed }) {
  getNewestThread(db, {
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
