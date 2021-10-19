import { isExactMatch, isRegexMatch } from './filters'

describe('isExactMatch', () => {
  it('should return true when included in filter', () => {
    expect(isExactMatch('foobar', 'foobar')).toBe(true)
  })

  it('should return true even with case differences', () => {
    expect(isExactMatch('FOOBAR', 'foobar')).toBe(true)
    expect(isExactMatch('foobar', 'FOOBAR')).toBe(true)
  })

  it('should return false when included in filter', () => {
    expect(isExactMatch('foobar', 'foo')).toBe(false)
  })
})

describe('isRegexMatch', () => {
  it('should return true when a regex matches', () => {
    expect(isRegexMatch('This is the greatest and best test in the world.. tribute.', '.*test.*')).toBe(true)
  })

  it('should return true when a regex matches with difference case', () => {
    expect(isRegexMatch('THIS IS THE GREATEST AND BEST TEST IN THE WORLD.. TRIBUTE.', '.*test.*')).toBe(true)
  })

  it('should return false when no regex matches', () => {
    expect(isRegexMatch('This is the greatest and best test in the world.. tribute.', '.*foobar.*')).toBe(false)
  })
})
