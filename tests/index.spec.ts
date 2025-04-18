/* eslint-disable no-unused-expressions */
console.log(process.cwd());
import { expect } from 'chai'
import { bget } from '../src'

describe('bget: API', () => {
  describe('Argument: Object', () => {
    it('returns default value for Non Object and Non Iterable types', () => {
      const defaultValue = { id: 'default' }
      expect(bget(undefined, '', defaultValue)).to.equal(defaultValue)
      expect(bget(null, '', defaultValue)).to.equal(defaultValue)
      expect(bget(false, '', defaultValue)).to.equal(defaultValue)
      expect(bget('test string', '', defaultValue)).to.equal(defaultValue)
      expect(bget(false, '', defaultValue)).to.equal(defaultValue)
      expect(bget(1, '', defaultValue)).to.equal(defaultValue)
      expect(bget(undefined, '', defaultValue)).to.equal(defaultValue)
    })
  })

  describe('Argument: Path', () => {
    it('returns root object for empty paths and undefined', () => {
      const testObject = { id: 'root' }
      const testList = ['root']
      const defaultValue = { id: 'default' }

      expect(bget(testObject, '', defaultValue)).to.equal(testObject)
      expect(bget(testList, '', defaultValue)).to.equal(testList)

      /* eslint-disable no-new-wrappers */
      expect(bget(testList, new String(), defaultValue)).to.equal(testList)
      expect(bget(testObject, new String(), defaultValue)).to.equal(testObject)
      /* eslint-enable no-new-wrappers */
      expect(bget(testList, undefined, defaultValue)).to.equal(testList)
    })

    it('returns default value when path is not a string', () => {
      const testObject = { id: 'root' }
      const defaultValue = { id: 'default' }

      expect(bget(testObject, null, defaultValue)).to.equal(defaultValue)
      expect(bget(testObject, 1, defaultValue)).to.equal(defaultValue)
      expect(bget(testObject, {}, defaultValue)).to.equal(defaultValue)
    })
  })

  describe('Argument: Default Value', () => {
    it('returns default argument when default argument is provided', () => {
      const testObject = { id: 'root' }
      const path = 'nonexistent.path'
      const defaultValue = { id: 'default' }

      expect(bget(testObject, path, defaultValue)).to.equal(defaultValue)
    })

    it('returns undefined when default argument is not provided', () => {
      const testObject = { id: 'root' }
      const path = 'nonexistent.path'
      const invalidPathArgument = {}

      expect(bget(testObject, path)).to.be.undefined
      expect(bget(testObject, invalidPathArgument)).to.be.undefined
    })
  })
})

describe('0 degree', () => {
  it('empty path returns root object', () => {
    const testObject = { id: 'root' }
    const testList = [{ id: 'listItem1' }, { id: 'listItem2' }]
    const path = ''

    expect(bget(testObject, path)).to.equal(testObject)
    expect(bget(testList, path)).to.equal(testList)
  })

  it('single dot returns root object', () => {
    const testObject = { id: 'root' }
    const path = '.'
    const defaultValue = { id: 'default' }
    expect(bget(testObject, path)).to.equal(testObject)
    expect(bget(testObject, path, defaultValue)).to.equal(testObject)
  })

  it('single bracket pair returns root object', () => {
    const testList = [{ id: 'listItem1' }, { id: 'listItem2' }]
    const path = '[]'

    expect(bget(testList, path)).to.deep.equal(testList)
  })

  it('returns a filtered list', () => {
    const testList = [{ id: 'first' }, { id: 'second' }]
    expect(bget(testList, "[id === 'first']")).to.deep.equal([{ id: 'first' }])
  })
})

describe('1st degree', () => {
  it('returns a direct field within an object', () => {
    const testObject = {
      id: 'zero',
      first: {
        id: 'first'
      }
    }
    expect(bget(testObject, 'first')).to.deep.equal(testObject.first)
  })

  it('returns a list of field values from a list', () => {
    const testList = [{ id: 'first' }, { id: 'second' }]
    expect(bget(testList, 'id')).to.deep.equal(['first', 'second'])
  })

  it('returns a list of field of values from a list when using bracket notation', () => {
    const testList = [{ id: 'first' }, { id: 'second' }]
    expect(bget(testList, '[].id')).to.deep.equal(['first', 'second'])
  })

  it('returns an object from a list by index', () => {
    const testList = [{ id: 'first' }, { id: 'second' }]
    expect(bget(testList, '[1]')).to.deep.equal({ id: 'second' })
  })
})

describe('Nth degree', () => {
  it('allows chained properties to retreive nested values', () => {
    const testObject = {
      id: 'zero',
      first: {
        id: 'first',
        second: {
          id: 'second'
        }
      }
    }
    expect(bget(testObject, 'first.id')).to.equal('first')
    expect(bget(testObject, 'first.second.id')).to.equal('second')
  })
  it('allows multiple chained to map leaf nodes', () => {
    const testList = [
      [{ id: 'primary.first' }, { id: 'primary.second' }],
      [{ id: 'secondary.first' }, { id: 'secondary.second' }]
    ]

    expect(bget(testList, '[][].id'))
      .to.deep.equal([['primary.first', 'primary.second'], ['secondary.first', 'secondary.second']])
  })
})

describe('bget: invalid paths', () => {
  describe('on objects', () => {

  })

  describe('on array', () => {
    it('returns undefined or default value when path uses brackes on object', () => {
      const testObject = {
        id: 'zero',
        first: {
          id: 'first'
        }
      }
      const defaultValue = { id: 'default' }

      expect(bget(testObject, '[id === "zero"]')).to.be.undefined
      expect(bget(testObject, '[id === "zero"]', defaultValue)).to.equal(defaultValue)
    })
  })
})

describe('Reduce operator (<)', () => {
  it('flattens nested arrays', () => {
    const nestedList = [
      [1, 2, 3],
      [4, 5, 6]
    ]
    expect(bget(nestedList, '<')).to.deep.equal([1, 2, 3, 4, 5, 6])
  })

  it('flattens nested arrays of objects', () => {
    const nestedList = [
      [{ id: 'a' }, { id: 'b' }],
      [{ id: 'c' }, { id: 'd' }]
    ]
    expect(bget(nestedList, '<')).to.deep.equal([
      { id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }
    ])
  })

  it('flattens and then applies further operations', () => {
    const nestedList = [
      [{ id: 'a', value: 1 }, { id: 'b', value: 2 }],
      [{ id: 'c', value: 3 }, { id: 'd', value: 4 }]
    ]
    expect(bget(nestedList, '<.id')).to.deep.equal(['a', 'b', 'c', 'd'])
  })

  it('works with complex nested structures', () => {
    const complexList = [
      [{ items: [{ id: 'a1' }, { id: 'a2' }] }],
      [{ items: [{ id: 'b1' }, { id: 'b2' }] }]
    ]
    expect(bget(complexList, '<.items[].id')).to.deep.equal([
      ['a1', 'a2'], ['b1', 'b2']
    ])
  })
})

describe('Multiple fields selector (+)', () => {
  it('selects multiple fields from an object', () => {
    const obj = { id: '123', name: 'John', age: 30 }
    expect(bget(obj, 'id+name')).to.deep.equal({ id: '123', name: 'John' })
  })

  it('selects multiple fields from objects in an array', () => {
    const list = [
      { id: '1', name: 'John', age: 30 },
      { id: '2', name: 'Jane', age: 25 }
    ]
    expect(bget(list, 'id+name')).to.deep.equal([
      { id: '1', name: 'John' },
      { id: '2', name: 'Jane' }
    ])
  })

  it('works with further path traversal', () => {
    const list = [
      { id: '1', user: { name: 'John', email: 'john@example.com' } },
      { id: '2', user: { name: 'Jane', email: 'jane@example.com' } }
    ]
    // First get the user objects
    const users = bget(list, 'user')
    // Then get the name and email fields from each user
    expect(bget(users, 'name+email')).to.deep.equal([
      { name: 'John', email: 'john@example.com' },
      { name: 'Jane', email: 'jane@example.com' }
    ])
  })

  it('returns default value when a field does not exist', () => {
    const obj = { id: '123', name: 'John' }
    const defaultValue = { error: 'Field not found' }
    expect(bget(obj, 'id+nonexistent', defaultValue)).to.equal(defaultValue)
  })
})
