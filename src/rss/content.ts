function getEmbeddedImage(content: string): string | undefined {
  const match = content.match(/\[\\\[link\\\]\]\((https.*?(jpeg|jpg|gif|png))\)/im)
  return match ? match[1] : undefined
}

function getThumbnailImage(content: string): string | undefined {
  const match = content.match(/https.*?(jpeg|jpg|gif|png)/im)
  return match ? match[0] : undefined
}

export function getEmbeddedContent(message: string): { image: string | undefined; summary: string } {
  const image = getEmbeddedImage(message)
  const thumbnail = getThumbnailImage(message)

  const summaryParse = message.match(/(.*?)(\[\\\[.*?link.*)/ims)

  if (!summaryParse) {
    return { image: image || thumbnail, summary: message.substr(0, 1024) }
  }

  const footer: string = summaryParse[2]
  const content: string = summaryParse[1]
  const hasImage = image || thumbnail
  const summary = hasImage && summaryParse ? footer : `${content.substr(0, 1024 - `\n${footer}`.length)}\n${footer}`

  return { image: image || thumbnail, summary }
}
