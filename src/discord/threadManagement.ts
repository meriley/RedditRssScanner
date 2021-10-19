import { BaseGuildTextChannel, Client, ThreadChannel, ThreadChannelTypes, ThreadCreateOptions } from 'discord.js'
import { CronJob } from 'cron'
import { getActiveChannelSubscribers, addThread, ChannelRow, getNewestThread, ThreadRow, getThreadSubscribers, ThreadSubscriberRow, upsertThreadSubscriber, upsertSubreddit } from '../db'

export async function createThread(paramaters: { channel: BaseGuildTextChannel; threadParams: ThreadCreateOptions<ThreadChannelTypes> }): Promise<string | undefined> {
  if (!paramaters.channel) {
    console.error('could not find channel')
    return undefined
  }

  const {
    channel,
    threadParams: { name, autoArchiveDuration = 'MAX', reason },
  } = paramaters

  const thread = await channel.threads
    .create({
      name: name,
      autoArchiveDuration,
      reason: reason,
    })
    .catch(console.error)

  if (!thread) {
    return undefined
  }

  addMembersToThread({ channel, thread })

  return thread.id
}

function addMembersToThread(paramaters: { channel: BaseGuildTextChannel; thread: ThreadChannel }) {
  const subscriberCallback = (subscriber: ThreadSubscriberRow | undefined) => {
    if (subscriber) {
      paramaters.thread.members.add(subscriber.memberId)
    }
  }
  getThreadSubscribers({
    channelId: paramaters.channel.id,
    callback: subscriberCallback,
  })
}

export async function addMemberToLatestThread({ client, channelId, memberId }: { client: Client; channelId: string; memberId: string }) {
  const channel: BaseGuildTextChannel = (await client.channels.fetch(channelId)) as BaseGuildTextChannel

  const latestThreadCallback = async (threadRow: ThreadRow | undefined) => {
    if (threadRow) {
      const thread = await channel.threads.fetch(threadRow.id)
      if (!thread) {
        console.error('unable to fetch thread to add subscriber')
      } else {
        upsertThreadSubscriber({ memberId, channelId, active: true })
        thread.members.add(memberId).catch(err => err.message)
      }
    }
  }
  getNewestThread({ channelId: channel.id, callback: latestThreadCallback })
}

export async function removeMemberFromLatestThread({ client, channelId, memberId }: { client: Client; channelId: string; memberId: string }) {
  const channel: BaseGuildTextChannel = (await client.channels.fetch(channelId)) as BaseGuildTextChannel

  const latestThreadCallback = async (threadRow: ThreadRow | undefined) => {
    if (threadRow) {
      const thread = await channel.threads.fetch(threadRow.id)
      if (!thread) {
        console.error('unable to fetch thread to add subscriber')
      } else {
        upsertThreadSubscriber({ memberId, channelId, active: false })
        thread.members.remove(memberId).catch(err => err.message)
      }
    }
  }
  getNewestThread({ channelId: channel.id, callback: latestThreadCallback })
}

// Todo: This is messy and had duplicate code. Need to clean up.
export function initializeThreads(client: Client): void {
  const activeChannelsFn = async (channelRow: ChannelRow) => {
    const callback = async (thread: ThreadRow | undefined) => {
      const channel: BaseGuildTextChannel | null = (await client.channels.fetch(channelRow.id)) as BaseGuildTextChannel | null

      if (!channel) {
        console.error(`Failed to retrieve channel ${channelRow.id}`)
        return undefined
      }

      const threadParams: ThreadCreateOptions<ThreadChannelTypes> = {
        startMessage: 'Test Thread In Progress',
        reason: 'New Daily News Thread',
        name: `Daily ${channelRow.subredditId} News`,
        autoArchiveDuration: 'MAX',
      }

      if (!thread) {
        const threadId = await createThread({ channel, threadParams })
        if (!threadId) {
          console.error('Failed to create thread')
          return undefined
        }
        addThread({ id: threadId, channelId: channelRow.id })
      } else {
        const nowDay = new Date().getDay()
        const latestThreadDate = new Date(thread.createdAt || '').getDay()
        if (nowDay != latestThreadDate) {
          const threadId = await createThread({ channel, threadParams })
          if (!threadId) {
            console.error('Failed to create thread')
            return undefined
          }
          addThread({ id: threadId, channelId: channelRow.id })
        }
      }
    }
    getNewestThread({ channelId: channelRow.id, callback })
  }
  getActiveChannelSubscribers(activeChannelsFn)
}

export function initThreadsJob(client: Client) {
  console.log('initializing threads')
  initializeThreads(client)
  // Create a thread daily at midnight
  console.log('starting thread generation job')
  new CronJob(
    '0 0 * * *',
    async function () {
      // Callback to create a thread based on Database stored channel IDs
      const createThreadFn = async (channelRow: ChannelRow) => {
        const channel: BaseGuildTextChannel | null = (await client.channels.fetch(channelRow.id)) as BaseGuildTextChannel | null

        if (!channel) {
          console.error(`Failed to retrieve channel ${channelRow.id}`)
          return undefined
        }

        const threadParams: ThreadCreateOptions<ThreadChannelTypes> = {
          startMessage: 'Test Thread In Progress',
          reason: 'New Daily News Thread',
          name: `Daily ${channelRow.subredditId} News`,
          autoArchiveDuration: 'MAX',
        }

        const threadId = await createThread({ channel, threadParams })
        if (!threadId) {
          console.error('Failed to create thread')
          return undefined
        }
        addThread({ id: threadId, channelId: channelRow.id })
      }
      // Get all active Channel Subscriptions
      getActiveChannelSubscribers(createThreadFn)
    },
    null,
    true,
    'America/Phoenix'
  ).start()
}
