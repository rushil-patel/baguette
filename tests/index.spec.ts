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

// Tests for the new features
describe('Reduce operation (<)', () => {
  it('flattens nested arrays into a single array', () => {
    const nestedArrays = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    expect(bget(nestedArrays, '<')).to.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('flattens nested object arrays', () => {
    const nestedObjects = [
      [{ id: 'a1' }, { id: 'a2' }],
      [{ id: 'b1' }, { id: 'b2' }]
    ]
    expect(bget(nestedObjects, '<')).to.deep.equal([
      { id: 'a1' }, { id: 'a2' }, { id: 'b1' }, { id: 'b2' }
    ])
  })

  it('works with chained operations', () => {
    const nestedObjects = [
      [{ id: 'a1', value: 1 }, { id: 'a2', value: 2 }],
      [{ id: 'b1', value: 3 }, { id: 'b2', value: 4 }]
    ]
    expect(bget(nestedObjects, '<.id')).to.deep.equal(['a1', 'a2', 'b1', 'b2'])
  })

  it('works with complex nested structures', () => {
    const complexNested = [
      [[{ name: 'deep1' }], [{ name: 'deep2' }]],
      [[{ name: 'deep3' }], [{ name: 'deep4' }]]
    ]
    expect(bget(complexNested, '<')).to.deep.equal([
      [{ name: 'deep1' }], [{ name: 'deep2' }],
      [{ name: 'deep3' }], [{ name: 'deep4' }]
    ])
    expect(bget(complexNested, '<.name')).to.be.undefined // This should fail as the first level is still arrays
    expect(bget(complexNested, '<<.name')).to.deep.equal(['deep1', 'deep2', 'deep3', 'deep4'])
  })
})

describe('Multiple fields (+)', () => {
  it('returns multiple fields from objects', () => {
    const obj = { name: 'John', age: 30, city: 'New York' }
    expect(bget(obj, 'name+age')).to.deep.equal({ name: 'John', age: 30 })
  })

  it('returns multiple fields from arrays of objects', () => {
    const people = [
      { name: 'John', age: 30, city: 'New York' },
      { name: 'Jane', age: 25, city: 'Boston' }
    ]
    expect(bget(people, 'name+age')).to.deep.equal([
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 }
    ])
  })

  it('works with array indexing', () => {
    const people = [
      { name: 'John', age: 30, city: 'New York' },
      { name: 'Jane', age: 25, city: 'Boston' }
    ]
    expect(bget(people, '[0].name+age')).to.deep.equal({ name: 'John', age: 30 })
  })

  it('works with filtering', () => {
    const people = [
      { name: 'John', age: 30, city: 'New York' },
      { name: 'Jane', age: 25, city: 'Boston' }
    ]
    expect(bget(people, "[age > 25].name+city")).to.deep.equal([
      { name: 'John', city: 'New York' }
    ])
  })

  it('throws an error when a field does not exist', () => {
    const obj = { name: 'John', age: 30 }
    expect(bget(obj, 'name+nonexistent', 'default')).to.equal('default')
  })
})
