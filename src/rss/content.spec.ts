import { getEmbeddedContent } from './content'
import { longSummary, longInvalid, validImageEntry, validThumbnail } from './test/constants'

describe('getEmbeddedContent', () => {
  it('should parse an entry with a valid image', () => {
    expect(getEmbeddedContent(validImageEntry)).toEqual({
      image: 'https://i.redd.it/6t9xhsv39jj41.jpg',
      summary: '[\\[link\\]](https://i.redd.it/6t9xhsv39jj41.jpg) [\\[comments\\]](https://www.reddit.com/r/pathofexile/comments/faj4gh/heres_another_new_notable_overshock/)',
    })
  })

  it('should parse a long message and abbreviate it', () => {
    expect(getEmbeddedContent(longSummary).summary).toBeDefined()
    expect(getEmbeddedContent(longSummary).summary.length).toBe(1024)
    expect(getEmbeddedContent(longSummary)).toEqual({
      image: undefined,
      summary: `* * *\n\n\\[LOOTFILTER\\] NeverSink's itemfilter 7.7.1\n-------------------------------------------\n\nTierlists are a bit more up-to-date and improved, I've added a vial-tierlist that pulls data from poe.ninja and is updated every patch now. This is a rather small update, however...\n\nQuite a few things have changed on the side of [https://www.filterblade.xyz](https://www.filterblade.xyz) . Tobnac will post the full changelog of our work in the comments, but here are the highlights:\n\nWe've improved error handling, inform users much better and [suggest fixes and give error location jump buttons, if people do something really stupid.](https://imgur.com/srPXvqw). Also [item highlight in the customizer has been further improved](https://imgur.com/gcaWulO). Tobnac, Haggis and me also worked on fixing a bu\n[\\[link\\]](https://www.reddit.com/r/pathofexile/comments/fahrrn/lootfilter_neversinks_itemfilter_771_vial/) [\\[comments\\]](https://www.reddit.com/r/pathofexile/comments/fahrrn/lootfilter_neversinks_itemfilter_771_vial/)`,
    })
  })

  it('should parse an invalid message and return it with no image', () => {
    expect(getEmbeddedContent(longInvalid).summary).toBeDefined()
    expect(getEmbeddedContent(longInvalid).summary).toBe(getEmbeddedContent(longInvalid).summary.substr(0, 1024))
    expect(getEmbeddedContent(longInvalid).summary.length).toBe(1024)
  })

  it('should parse a valid thumbnail if no image is provided', () => {
    expect(getEmbeddedContent(validThumbnail)).toEqual({
      image: 'https://b.thumbs.redditmedia.com/kUkb6Z50hN_ZFN1-4LSapbM-3X9HwLToCSiRVc5P4nQ.jpg',
      summary: '[\\[link\\]](https://www.pathofexile.com/forum/view-thread/2782234) [\\[comments\\]](https://www.reddit.com/r/pathofexile/comments/fdm647/manabased_gems_and_stormbind_demo/)',
    })
  })
})
