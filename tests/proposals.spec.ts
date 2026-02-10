import { expect } from 'chai'
import { bget } from '../src'

describe('Unfinished functionality from README', () => {
  describe('reduce (<)', () => {
    it('flattens out nested lists', () => {
      const nestedLists = [[{ name: 'tiger' }, { name: 'lion' }], [{ name: 'wolf' }, { name: 'dog' }]]
      // According to README proposal: bget(foo, '[]<[]') flattens out the nests lists into single list
      // So bget(nestedLists, '[]<[]') should probably return [{name: 'tiger'}, {name: 'lion'}, {name: 'wolf'}, {name: 'dog'}]
      expect(bget(nestedLists, '[]<[]')).to.deep.equal([
        { name: 'tiger' },
        { name: 'lion' },
        { name: 'wolf' },
        { name: 'dog' }
      ])
    })

    it('flattens with further path', () => {
        const nestedLists = [[{ name: 'tiger' }, { name: 'lion' }], [{ name: 'wolf' }, { name: 'dog' }]]
        expect(bget(nestedLists, '[]<[].name')).to.deep.equal(['tiger', 'lion', 'wolf', 'dog'])
    })
  })

  describe('get multiple fields (+)', () => {
    it('returns a mapping of items with multiple fields', () => {
      const items = [
        { fieldOne: '1a', fieldTwo: '2a', fieldThree: '3a' },
        { fieldOne: '1b', fieldTwo: '2b', fieldThree: '3b' }
      ]
      // According to README proposal: bget(foo, '[].fieldOne+fieldTwo') returns a mapping of items with the fieldsOne and fieldsTwo
      expect(bget(items, '[].fieldOne+fieldTwo')).to.deep.equal([
        { fieldOne: '1a', fieldTwo: '2a' },
        { fieldOne: '1b', fieldTwo: '2b' }
      ])
    })
  })

})
