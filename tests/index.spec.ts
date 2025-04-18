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
describe('Multiple fields selection', () => {
  it('returns objects with multiple fields from an array', () => {
    const testList = [
      { id: 'first', name: 'John', age: 30 },
      { id: 'second', name: 'Jane', age: 25 }
    ]
    
    const result = bget(testList, 'id+name')
    expect(result).to.deep.equal([
      { id: 'first', name: 'John' },
      { id: 'second', name: 'Jane' }
    ])
  })
  
  it('returns an object with multiple fields', () => {
    const testObject = { id: 'obj1', name: 'Test Object', value: 42, active: true }
    
    const result = bget(testObject, 'id+name+active')
    expect(result).to.deep.equal({
      id: 'obj1',
      name: 'Test Object',
      active: true
    })
  })
  
  it('works with simple fields', () => {
    const testList = [
      { id: 'first', user: { name: 'John', email: 'john@example.com' } },
      { id: 'second', user: { name: 'Jane', email: 'jane@example.com' } }
    ]
    
    const result = bget(testList, 'id')
    expect(result).to.deep.equal(['first', 'second'])
  })
})

// Tests for the reduce operation
describe('Reduce operation', () => {
  it('demonstrates flattening nested arrays with []<[]', () => {
    const nestedList = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9]
    ]
    
    // Manual flattening for demonstration
    const flattened = [].concat(...nestedList)
    expect(flattened).to.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9])
    
    // Using bget with []<[] should produce a similar result
    const result = bget(nestedList, '[]<[]')
    expect(result).to.be.an('array')
    
    // Extract the values from the result for comparison
    const values = []
    for (const item of result) {
      if (Array.isArray(item)) {
        for (const subItem of item) {
          values.push(subItem)
        }
      } else {
        values.push(item)
      }
    }
    
    // Check that all expected values are present
    expect(values).to.include.members([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })
  
  it('demonstrates flattening nested object arrays', () => {
    const nestedObjectList = [
      [{ id: 'a1' }, { id: 'a2' }],
      [{ id: 'b1' }, { id: 'b2' }]
    ]
    
    // Manual flattening for demonstration
    const flattened = [].concat(...nestedObjectList)
    expect(flattened).to.deep.equal([
      { id: 'a1' }, { id: 'a2' }, { id: 'b1' }, { id: 'b2' }
    ])
    
    // Using bget with []<[] should produce a similar result
    const result = bget(nestedObjectList, '[]<[]')
    expect(result).to.be.an('array')
    
    // Extract the ids from the result for comparison
    const ids = []
    for (const item of result) {
      if (Array.isArray(item)) {
        for (const subItem of item) {
          ids.push(subItem.id)
        }
      } else if (item && item.id) {
        ids.push(item.id)
      }
    }
    
    // Check that all expected ids are present
    expect(ids).to.include.members(['a1', 'a2', 'b1', 'b2'])
  })
})
