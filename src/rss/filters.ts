export function isExactMatch(content: string, filter?: string[]): boolean {
  if (!filter) {
    return false
  }

  return filter.map(f => f.toLowerCase()).includes(content.toLowerCase())
}

export function isRegexMatch(content: string, filter?: string[]): boolean {
  if (!filter) {
    return false
  }
  const regex = filter.map(f => new RegExp(f, 'mi'))

  return regex.reduce((acc: boolean, r: RegExp) => {
    const isMatch = content.match(r) != null
    return acc || isMatch
  }, false)
}
