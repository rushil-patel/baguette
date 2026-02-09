import { expect } from 'chai'
import { bget } from '../src'

describe('bget: proposals', () => {
  describe('reduce (<)', () => {
    it('flattens out nested lists into single list', () => {
      const nestedLists = [[{ name: 'tiger' }, { name: 'lion' }], [{ name: 'wolf' }, { name: 'dog' }]]
      expect(bget(nestedLists, '[]<[]')).to.deep.equal([
        { name: 'tiger' },
        { name: 'lion' },
        { name: 'wolf' },
        { name: 'dog' }
      ])
    })

    it('flattens and then allows further path traversal', () => {
        const nestedLists = [[{ name: 'tiger' }, { name: 'lion' }], [{ name: 'wolf' }, { name: 'dog' }]]
        expect(bget(nestedLists, '[]<[].name')).to.deep.equal(['tiger', 'lion', 'wolf', 'dog'])
    })
  })

  describe('get multiple fields (+)', () => {
    it('returns a mapping of items with multiple fields', () => {
      const testList = [
        { id: '1', name: 'first', extra: 'foo' },
        { id: '2', name: 'second', extra: 'bar' }
      ]
      expect(bget(testList, '[].id+name')).to.deep.equal([
        { id: '1', name: 'first' },
        { id: '2', name: 'second' }
      ])
    })

    it('works on a single object', () => {
        const testObject = { id: '1', name: 'first', extra: 'foo' }
        expect(bget(testObject, 'id+name')).to.deep.equal({ id: '1', name: 'first' })
    })
  })
})
