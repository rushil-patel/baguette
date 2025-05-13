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

describe('bget: flatten and projection/advanced operators', () => {
  it('flattens a nested array using []<[]', () => {
    const nested = [[{ name: 'tiger' }, { name: 'lion' }], [{ name: 'wolf' }, { name: 'dog' }]];
    // flatten to single level of objects
    expect(bget(nested, '[]<[]')).to.deep.equal([{ name: 'tiger' }, { name: 'lion' }, { name: 'wolf' }, { name: 'dog' }]);
  });
  it('returns property from objects in flattened array ([]<[].name)', () => {
    const nested = [[{ name: 'tiger' }, { name: 'lion' }], [{ name: 'wolf' }, { name: 'dog' }]];
    expect(bget(nested, '[]<[].name')).to.deep.equal(['tiger', 'lion', 'wolf', 'dog']);
  });
  it('projects multiple fields using + operator ([].foo+bar)', () => {
    const list = [
      { foo: 1, bar: 2, ignore: true },
      { foo: 3, bar: 4, ignore: false },
    ];
    expect(bget(list, '[].foo+bar')).to.deep.equal([
      { foo: 1, bar: 2 },
      { foo: 3, bar: 4 },
    ]);
  });
  it('projects multiple fields from a nested list ([][]<[].foo+bar)', () => {
    const nested = [
      [ { foo: 1, bar: 2, extra: 9 } ],
      [ { foo: 5, bar: 6, extra: 10 } ],
    ];
    expect(bget(nested, '[]<[].foo+bar')).to.deep.equal([
      { foo: 1, bar: 2 },
      { foo: 5, bar: 6 },
    ]);
  });
  it('returns correct values when operator chains follow another operator', () => {
    const nested = [
      [{ a: 1, b: 9 }, { a: 2 }],
      [{ a: 3, b: 4 }]
    ];
    expect(bget(nested, '[]<[].a')).to.deep.equal([1, 2, 3]);
    expect(bget(nested, '[]<[].a+b')).to.deep.equal([
      { a: 1, b: 9 },
      { a: 2 },
      { a: 3, b: 4 }
    ]);
  });
});

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
