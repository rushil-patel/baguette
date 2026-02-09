import { expect } from 'chai'
import { bget } from '../src'

describe('bget: Proposals', () => {
  describe('Flatten operator (<)', () => {
    it('flattens out the nests lists into single list', () => {
      const nestedLists = [[{ name: 'tiger' }, { name: 'lion' }], [{ name: 'wolf' }, { name: 'dog' }]]
      expect(bget(nestedLists, '[]<[].name')).to.deep.equal(['tiger', 'lion', 'wolf', 'dog'])
    })

    it('flattens nested arrays', () => {
        const foo = [[1], [2]]
        expect(bget(foo, '[]<[]')).to.deep.equal([1, 2])
    })
  })

  describe('Multiple fields operator (+)', () => {
    it('returns a mapping of items with the fieldOne and fieldTwo', () => {
        const items = [
            { id: '1', name: 'item 1', description: 'desc 1' },
            { id: '2', name: 'item 2', description: 'desc 2' }
        ]
        expect(bget(items, '[].id+name')).to.deep.equal([
            { id: '1', name: 'item 1' },
            { id: '2', name: 'item 2' }
        ])
    })

    it('works on a single object', () => {
        const item = { id: '1', name: 'item 1', description: 'desc 1' }
        expect(bget(item, 'id+name')).to.deep.equal({ id: '1', name: 'item 1' })
    })
  })
})
