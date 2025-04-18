/* eslint-disable no-unused-expressions */
import { expect } from 'chai'
import { bget } from '../src'

describe('bget: Reduce Operation', () => {
  it('flattens nested arrays with []<[]', () => {
    const nestedArrays = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    expect(bget(nestedArrays, '<[]')).to.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('flattens nested object arrays', () => {
    const nestedObjectArrays = [
      [{ id: 'a1' }, { id: 'a2' }],
      [{ id: 'b1' }, { id: 'b2' }]
    ]
    expect(bget(nestedObjectArrays, '<[]')).to.deep.equal([
      { id: 'a1' }, { id: 'a2' }, { id: 'b1' }, { id: 'b2' }
    ])
  })

  it('handles empty arrays', () => {
    const emptyArray = []
    expect(bget(emptyArray, '<[]')).to.deep.equal([])
  })

  it('handles arrays with empty nested arrays', () => {
    const arrayWithEmptyArrays = [[], [], []]
    expect(bget(arrayWithEmptyArrays, '<[]')).to.deep.equal([])
  })

  it('handles mixed content arrays', () => {
    const mixedArray = [[1, 2], 3, [4, 5]]
    expect(bget(mixedArray, '<[]')).to.deep.equal([1, 2, 3, 4, 5])
  })

  it('can be chained with other operations', () => {
    const nestedObjectArrays = [
      [{ id: 'a1', value: 10 }, { id: 'a2', value: 20 }],
      [{ id: 'b1', value: 30 }, { id: 'b2', value: 40 }]
    ]
    expect(bget(nestedObjectArrays, '<[].id')).to.deep.equal(['a1', 'a2', 'b1', 'b2'])
  })
})

describe('bget: Multiple Fields', () => {
  it('gets multiple fields from an object', () => {
    const obj = { id: '123', name: 'John', age: 30, email: 'john@example.com' }
    expect(bget(obj, 'id+name')).to.deep.equal({ id: '123', name: 'John' })
  })

  it('gets multiple fields from an array of objects', () => {
    const array = [
      { id: '1', name: 'John', age: 30 },
      { id: '2', name: 'Jane', age: 25 }
    ]
    expect(bget(array, 'id+name')).to.deep.equal([
      { id: '1', name: 'John' },
      { id: '2', name: 'Jane' }
    ])
  })

  it('returns default value when a field does not exist', () => {
    const obj = { id: '123', name: 'John' }
    const defaultValue = { error: 'Field not found' }
    expect(bget(obj, 'id+nonexistent', defaultValue)).to.equal(defaultValue)
  })

  it('can be chained with array operations', () => {
    const array = [
      { id: '1', name: 'John', age: 30, address: { city: 'New York', zip: '10001' } },
      { id: '2', name: 'Jane', age: 25, address: { city: 'Boston', zip: '02108' } }
    ]
    expect(bget(array, '[].address.city+zip')).to.deep.equal([
      { city: 'New York', zip: '10001' },
      { city: 'Boston', zip: '02108' }
    ])
  })

  it('works with nested objects', () => {
    const obj = {
      user: {
        id: '123',
        name: 'John',
        contact: {
          email: 'john@example.com',
          phone: '555-1234'
        }
      }
    }
    expect(bget(obj, 'user.contact.email+phone')).to.deep.equal({
      email: 'john@example.com',
      phone: '555-1234'
    })
  })
})
