export function isExactMatch(content: string, filter: string): boolean {
  if (!filter) {
    return false
  }
  return filter.toLowerCase().includes(content.toLowerCase())
}

export function isRegexMatch(content: string, filter: string): boolean {
  if (!filter) {
    return false
  }
  const regex = new RegExp(filter, 'mi')
  return content.match(regex) != null
}
