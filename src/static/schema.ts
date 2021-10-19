type WebhookType = {
  title: string
  url: string
}

export type FilterTestType = {
  exact?: string[]
  regex?: string[]
}

export type FiltersType = {
  author?: FilterTestType
  title?: FilterTestType
}

export type ConfigType = Array<{
  id: string
  rss: {
    subreddit: string
    sort?: 'new' | 'hot' | 'rising' | 'controversial'
    filters?: FiltersType
  }
  webhooks: WebhookType[]
}>
